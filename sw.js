// オフラインでも開けるようにするための、シンプルなキャッシュの仕組み。
// 「ネットにつながっていれば常に最新を取りに行き、つながっていなければ
// 前回保存しておいたものを表示する」という考え方にしている。
// (データそのものはlocalStorageに保存されるので、このキャッシュはあくまで
//  画面を表示するためのHTML/CSS/JS/画像だけが対象)

const CACHE_NAME = "calendar-app-shell-v1";

// 最初に開いたときから、なるべくオフラインで使えるようにしておく最小限のファイル。
// style.css/script.jsはバージョン番号(?v=)付きで読み込まれるが、そちらは
// 実際にアクセスされたタイミングでfetchハンドラー側が自動でキャッシュする。
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch((e) => console.error("初期キャッシュに失敗しました", e))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 取得に成功したら、次回オフラインになったときのために保存しておく
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        // オフラインなどで取得できなかった場合は、保存してあるものを使う
        caches.match(event.request).then((cached) => cached || caches.match("./index.html"))
      )
  );
});
