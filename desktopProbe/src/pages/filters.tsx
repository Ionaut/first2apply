import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { useError } from '@/hooks/error';
import { getAdvancedMatchingConfig, updateAdvancedMatchingConfig } from '@/lib/electronMainSdk';
import { Cross2Icon, InfoCircledIcon, MinusCircledIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { DefaultLayout } from './defaultLayout';

export function FiltersPage() {
  const { handleError } = useError();
  const { toast } = useToast();

  const [userAiInput, setUserAiInput] = useState<string>('');
  const [blacklistedCompanies, setBlacklistedCompanies] = useState<string[]>([]);
  const [addBlacklistedCompany, setAddBlacklistedCompany] = useState<string>('');

  /**
   * Load the advanced matching filters from the user's profile.
   */
  useEffect(() => {
    const asyncLoad = async () => {
      try {
        const config = await getAdvancedMatchingConfig();
        if (config) {
          setUserAiInput(config.chatgpt_prompt);
          setBlacklistedCompanies(config.blacklisted_companies);
        }
      } catch (error) {
        handleError({ error, title: 'Failed to load advanced matching filters' });
      }
    };
    asyncLoad();
  }, []);

  /**
   * Save the config to the database.
   */
  const onSave = async () => {
    try {
      const updatedConfig = await updateAdvancedMatchingConfig({
        chatgpt_prompt: userAiInput,
        blacklisted_companies: blacklistedCompanies,
      });
      setUserAiInput(updatedConfig.chatgpt_prompt);
      setBlacklistedCompanies(updatedConfig.blacklisted_companies);
      toast({ title: 'Advanced matching filters saved' });
    } catch (error) {
      handleError({ error, title: 'Failed to save advanced matching filters' });
    }
  };

  return (
    <DefaultLayout className="flex flex-col space-y-16 p-6 md:p-10">
      <h1 className="w-fit text-2xl font-medium tracking-wide">Advanced Matching</h1>

      <section>
        <p className="mb-4 text-lg">
          Set your preferences and let <span className="font-medium">AI</span> find the{' '}
          <span className="font-medium">right jobs</span> for you. Just tell us what you’re looking for:
        </p>

        <div className="relative">
          <TextareaAutosize
            value={userAiInput}
            placeholder='E.g. "Avoid Java or senior roles", "Seeking $60K+ salary, remote opportunities", "Suitable for under 2 years of experience"'
            autoFocus={true}
            onChange={(evt) => setUserAiInput(evt.target.value)}
            minRows={3}
            maxLength={200}
            className="w-full resize-none rounded-md border border-border bg-card px-6 py-4 text-base ring-ring placeholder:text-muted-foreground focus:outline-none focus:ring-2"
          />
          <span className="absolute bottom-4 right-4 text-sm text-muted-foreground">{userAiInput.length}/200</span>
        </div>

        <Alert className="flex items-center gap-2 border-0 p-0">
          <AlertTitle className="mb-0">
            <InfoCircledIcon className="h-4 w-4 text-muted-foreground" />
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            Pro Tips: Exclude skills you don’t want, specify salary expectations, define experience levels, select job
            specifics like remote work or PTO preferences and more.
          </AlertDescription>
        </Alert>
      </section>

      {/* HERE STARTS THE BLACKLISTING */}

      <section>
        <p className="mb-4 text-lg">
          <span className="font-medium">Blacklist companies</span> you don’t want to work for. We’ll make sure you{' '}
          <span className="font-medium">don’t see jobs</span> from them anymore:
        </p>

        <div className="flex w-full gap-2">
          <div className="relative flex-1">
            <Input
              value={addBlacklistedCompany}
              placeholder='E.g. "Luxoft"'
              onChange={(evt) => setAddBlacklistedCompany(evt.target.value)}
              maxLength={100}
              className="bg-card px-6 pr-20 text-base ring-ring placeholder:text-base focus-visible:ring-2"
            />
            <span className="absolute bottom-2 right-4 text-sm text-muted-foreground">
              {addBlacklistedCompany.length}/100
            </span>
          </div>

          <Button
            variant="secondary"
            className="w-36 border border-border"
            onClick={() => {
              if (addBlacklistedCompany) {
                setBlacklistedCompanies([...blacklistedCompanies, addBlacklistedCompany]);
                setAddBlacklistedCompany('');
              }
            }}
          >
            Add company
          </Button>
        </div>

        <Alert className="mt-1.5 flex items-center gap-2 border-0 p-0">
          <AlertTitle className="mb-0">
            <MinusCircledIcon className="h-4 w-4 text-destructive/90" />
          </AlertTitle>
          <AlertDescription className="text-sm text-destructive/90">
            Attention: Ensure you input the company name accurately without any typos.
          </AlertDescription>
        </Alert>

        <div className="mt-4">
          {blacklistedCompanies.length === 0 ? (
            <p>You haven't blacklisted any companies yet</p>
          ) : (
            <div className="flex gap-2">
              {blacklistedCompanies.map((company) => (
                <Badge
                  key={company}
                  className="flex items-center gap-2 border border-border bg-card py-1 pl-4 pr-2 text-base hover:bg-card"
                >
                  {company}
                  <TooltipProvider delayDuration={500}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Cross2Icon
                          className="h-4 w-4 text-foreground"
                          onClick={() => setBlacklistedCompanies(blacklistedCompanies.filter((c) => c !== company))}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="mt-2 text-sm">
                        Remove
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      <Button className="ml-auto w-36" onClick={onSave}>
        Save filters
      </Button>
    </DefaultLayout>
  );
}
