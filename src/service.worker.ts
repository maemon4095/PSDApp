import files from "$GENERATED_FILES";
import { unsafeAssertType } from "~/lib/utils/mod.ts";

const CACHE_NAME = `PSDApp-v0.1.0`;

self.addEventListener('install', (event) => {
    unsafeAssertType<ExtendableEvent>(event);
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll([
            ...files,
            '.',
            './public/icon.svg',
            './manifest.webmanifest'
        ]);
    })());
});

self.addEventListener('fetch', event => {
    unsafeAssertType<FetchEvent>(event);
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);

        if (cachedResponse) {
            return cachedResponse;
        } else {
            try {
                const fetchResponse = await fetch(event.request);
                await cache.put(event.request, fetchResponse.clone());
                return fetchResponse;
            } catch (e) {
                console.log("worker fetch error:", e);
                return Response.error();
            }
        }
    })());
});


type ExtendableEvent = Event & {
    waitUntil(promise: Promise<unknown>): void;
};

type FetchEvent = ExtendableEvent & {
    readonly clientId: string;
    readonly handled: Promise<void>;
    readonly preloadResponse: Promise<Response | undefined>;
    readonly replacesClientId: string;
    readonly resultingClientId: string;
    readonly request: Request;
    respondWith(response: Response | Promise<Response>): void;
};