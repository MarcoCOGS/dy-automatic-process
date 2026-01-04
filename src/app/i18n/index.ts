import { FlatNamespace, KeyPrefix, createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { FallbackNs } from 'react-i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { P, match } from 'ts-pattern';
import type { MaybeArray } from 'tsdef';

import { defaultNS, getOptions } from './settings';

const initI18next = async (lng: string, ns: MaybeArray<string>) => {
  // on server side we create a new instance for each render, because during compilation everything seems to be executed in parallel
  const i18nInstance = createInstance();

  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)))
    .init(getOptions(lng, ns));

  return i18nInstance;
};

export async function translation<Ns extends FlatNamespace, KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined>(
  lng: string,
  ns?: MaybeArray<Ns>,
  options: { keyPrefix?: KPrefix } = {},
) {
  const _ns = match(ns)
    .with(P.string, (n) => [n, defaultNS])
    .with(P.array(), (n) => [...(n as Ns[]), defaultNS])
    .otherwise(() => [defaultNS]) as string[];

  const i18nextInstance = await initI18next(lng, _ns);

  return {
    t: i18nextInstance.getFixedT(lng, ns, options.keyPrefix),
    i18n: i18nextInstance,
  };
}
