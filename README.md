# Tokenizer Karşılaştırma

Aynı metnin farklı modellerin tokenizer'larında kaç token tuttuğunu gösteren, tamamen tarayıcıda çalışan bir web uygulaması. Sol panelde 40 dili destekleyen [Magibu 3.5](https://huggingface.co/alibayram/magibu-3.5-128k-processor) sabittir; sağ panelde her üreticinin en güncel modeli arasından seçim yapılır: OpenAI (GPT-5/4o), Gemma 4, Llama 4, Grok 2, Qwen3.5, DeepSeek-V4, Mistral Medium 3.5, GLM-5.2 ve Türkçe modeller. Metin herhangi bir dilde denenebilir.

Daha az token = daha düşük API maliyeti, daha hızlı yanıt, daha geniş bağlam.

## Nasıl çalışır?

- Tüm tokenizer'lar [🤗 Transformers.js](https://github.com/huggingface/transformers.js) `AutoTokenizer` ile **tarayıcı içinde** yüklenir ve çalıştırılır; hiçbir sunucuya metin gönderilmez.
- Tokenizer dosyaları ilk seçimde Hugging Face Hub'dan indirilir (3–33 MB) ve tarayıcının Cache API'sinde saklanır.
- Kapalı modellerde açık tokenizer dönüşümleri kullanılır: OpenAI için `Xenova/gpt-4o` (o200k_base, GPT-5 dahil) ve `Xenova/gpt-4` (cl100k_base), Grok 2 için `alvarobartt/grok-2-tokenizer`. Gated olan resmi Llama repoları yerine gated olmayan `unsloth` mirror'ları kullanılır.
- Claude listede yok: Anthropic, modern Claude tokenizer'ını hiç yayınlamadı (halka açık olan tek şey 2023 dönemi Claude 1/2 tokenizer'ıdır ve güncel maliyeti temsil etmez).
- Sayımlar `add_special_tokens=false` ile yapılır (BOS/EOS eklenmez), böylece saf metin maliyeti karşılaştırılır.

## Geliştirme

```bash
npm install
npm run dev
```

## Derleme

```bash
npm run build   # çıktı: dist/
npm run preview # prod build'i yerelde dene
```

## Firebase Hosting'e yayınlama

`firebase.json` hazırdır (`dist` klasörünü yayınlar, SPA rewrite ve asset cache başlıkları ayarlıdır).

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # sadece projeyi seçmek için; "public" sorusuna dist deyin, mevcut firebase.json'u ezmeyin
npm run build
firebase deploy
```

## Yeni model ekleme

[src/lib/models.ts](src/lib/models.ts) dosyasındaki `COMPARISON_MODELS` listesine bir kayıt ekleyin. Tek koşul: repo'nun Hugging Face'te **gated olmaması** ve `tokenizer.json` içermesi.

```ts
{
  id: 'benzersiz-id',
  label: 'Dropdown etiketi',
  short: 'Kısa ad',
  repoId: 'kurum/model-adi',
  group: 'Grup başlığı',
  sizeMB: 10, // tokenizer.json'un yaklaşık boyutu (yükleme göstergesi için)
}
```
