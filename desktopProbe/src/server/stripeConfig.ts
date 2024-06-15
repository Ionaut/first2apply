import { StripeConfig } from '../../../supabase/functions/_shared/types';

const devConfig: StripeConfig = {
  customerPortalLink: 'https://billing.stripe.com/p/login/test_3csbLi9tW6AH48wfYY',
  plans: [
    {
      tier: 'basic',
      monthlyCheckoutLink: 'https://buy.stripe.com/test_4gwdTQfF44jdf726oo',
      quarterlyCheckoutLink: 'https://buy.stripe.com/test_9AQ6ro8cC1712kgdQR',
      biannuallyCheckoutLink: 'https://buy.stripe.com/test_dR66ro1Oe4jdbUQ8wy',
      yearlyCheckoutLink: 'https://buy.stripe.com/test_5kA8zweB0g1V6AwbIL',
    },
    {
      tier: 'pro',
      monthlyCheckoutLink: 'https://buy.stripe.com/test_aEUcPM2Si8zt6AwfZ2',
      quarterlyCheckoutLink: 'https://buy.stripe.com/test_bIY5nk8cC9Dxgb68wC',
      biannuallyCheckoutLink: 'https://buy.stripe.com/test_5kA030eB03f98IEdQV',
      yearlyCheckoutLink: 'https://buy.stripe.com/test_bIYg1Y78yaHB2kg4gn',
    },
  ],
};

const prodConfig: StripeConfig = {
  customerPortalLink: 'https://billing.stripe.com/p/login/9AQ01k3mt1h8aaI5kk',
  plans: [
    {
      tier: 'basic',
      monthlyCheckoutLink: 'https://buy.stripe.com/4gw5mv9vadTL5q0cMN',
      quarterlyCheckoutLink: 'https://buy.stripe.com/4gw6qz36MaHzbOofZ0',
      biannuallyCheckoutLink: 'https://buy.stripe.com/4gw4ir8r63f7bOo3cf',
      yearlyCheckoutLink: 'https://buy.stripe.com/28oaGP7n24jb9Gg7sw',
    },
    {
      tier: 'pro',
      monthlyCheckoutLink: 'https://buy.stripe.com/bIY16fgXC6rjg4E149',
      quarterlyCheckoutLink: 'https://buy.stripe.com/fZe7uD7n2dTLf0A6ou',
      biannuallyCheckoutLink: 'https://buy.stripe.com/8wM02bcHm16Z6u43cj',
      yearlyCheckoutLink: 'https://buy.stripe.com/14k6qz36M2b319KbIQ',
    },
  ],
};

export function getStripeConfig(nodeEnv: string) {
  return nodeEnv === 'production' ? prodConfig : devConfig;
}
