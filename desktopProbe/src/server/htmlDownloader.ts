import { BrowserWindow } from "electron";

import { backOff } from "exponential-backoff";
import { WorkerQueue } from "./workerQueue";
import { sleep } from "./helpers";
import { ILogger } from "./logger";

const KNOWN_AUTHWALLS = ["authwall", "login"];

/**
 * Wrapper over a headless window that can be used to download HTML.
 */
export class HtmlDownloader {
  private _isRunning = false;
  private _pool: BrowserWindowPool | undefined;

  /**
   * Class constructor.
   */
  constructor(private _logger: ILogger) {}

  /**
   * Initialize the headless window.
   */
  init() {
    this._pool = new BrowserWindowPool(2);
    this._isRunning = true;
  }

  /**
   * Load the HTML of a given URL with concurrency support.
   *
   * Takes in a callback that will be called with the HTML content. Will be retried if it fails
   * with a new version of the window's HTML. Using a callback instead of returning the HTML directly
   * because we need to keep the window aquired until the callback is finished.
   */
  async loadUrl<T>({
    url,
    scrollTimes = 3,
    callback,
  }: {
    url: string;
    scrollTimes?: number;
    callback: (_: {
      html: string;
      maxRetries: number;
      retryCount: number;
    }) => Promise<T>;
  }): Promise<T> {
    if (!this._pool) throw new Error("Pool not initialized");

    return this._pool.useBrowserWindow(async (window) => {
      await this._loadUrl(window, url, scrollTimes);

      const maxRetries = 1;
      let retryCount = 0;
      return backOff(
        async () => {
          const html: string = await window.webContents.executeJavaScript(
            "document.documentElement.innerHTML"
          );
          return callback({ html, maxRetries, retryCount: retryCount++ });
        },
        {
          jitter: "full",
          numOfAttempts: 1 + maxRetries,
          maxDelay: 5_000,
          startingDelay: 1_000,
          retry: () => {
            // perform retries only if the window is still running
            return this._isRunning;
          },
        }
      );
    });
  }

  /**
   * Close the headless window.
   */
  async close() {
    this._isRunning = false;
    return this._pool?.close();
  }

  /**
   * Load an URL and make sure to wait for the page to load.
   */
  private async _loadUrl(
    window: BrowserWindow,
    url: string,
    scrollTimes: number
  ) {
    if (!this._isRunning) return "<html></html>";

    this._logger.info(`loading url: ${url} ...`);
    await backOff(
      async () => {
        let statusCode: number | undefined;
        window.webContents.once(
          "did-navigate",
          (event, url, httpResponseCode) => {
            statusCode = httpResponseCode;
          }
        );
        await window.loadURL(url);

        // handle 429 status code
        if (statusCode === 429) {
          this._logger.debug(`429 status code detected: ${url}`);
          await sleep(5_000);
          throw new Error("rate limit exceeded");
        }

        // scroll to bottom a few times to trigger infinite loading
        for (let i = 0; i < scrollTimes; i++) {
          await window.webContents.executeJavaScript(
            'window.scrollTo({left:0, top: document.body.scrollHeight, behavior: "instant"});'
          );
          await sleep(2_000);

          // check if page was redirected to a login page
          const finalUrl = window.webContents.getURL();
          if (
            KNOWN_AUTHWALLS.some((authwall) => finalUrl?.includes(authwall))
          ) {
            this._logger.debug(`authwall detected: ${finalUrl}`);
            throw new Error("authwall");
          }
        }
      },
      {
        jitter: "full",
        numOfAttempts: 20,
        maxDelay: 5_000,
        retry: () => {
          // perform retries only if the window is still running
          return this._isRunning;
        },
      }
    );

    this._logger.info(`finished loading url: ${url}`);
  }
}

/**
 * Class used to manage a pool of headless windows.
 */
class BrowserWindowPool {
  private _pool: Array<{
    id: number;
    window: BrowserWindow;
    isAvailable: boolean;
  }> = [];
  private _queue: WorkerQueue;

  /**
   * Class constructor.
   */
  constructor(instances: number) {
    for (let i = 0; i < instances; i++) {
      this._pool.push({
        id: i,
        window: new BrowserWindow({
          show: false,
          // set the window size
          width: 1600,
          height: 1200,
          webPreferences: {
            // disable the same origin policy
            webSecurity: false,
            partition: `persist:scraper-${i}`,
          },
        }),
        isAvailable: true,
      });
    }

    this._queue = new WorkerQueue(instances);
  }

  /**
   * Get an available window and use it.
   */
  async useBrowserWindow<T>(fn: (window: BrowserWindow) => Promise<T>) {
    return this._queue.enqueue(() => {
      const worker = this._pool.find((w) => w.isAvailable);
      if (!worker) throw new Error("No available window found");
      worker.isAvailable = false;

      return fn(worker.window).finally(() => {
        worker.isAvailable = true;
      });
    });
  }

  /**
   * Wait until all windows are available and close them.
   */
  close() {
    return new Promise<void>((resolve) => {
      // wait until the queue is empty
      this._queue.on("empty", () => {
        this._pool.forEach((w) => w.window.close());

        // artificial delay to allow the window to close
        setTimeout(() => resolve(), 500);
      });

      // trigger the empty event if the queue is already empty
      this._queue.next();
    });
  }
}
