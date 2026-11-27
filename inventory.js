// Inventory of every apartment.
//
// To add an apartment, copy a block in `apartments` and give it a unique `id`.
// The id is used in the link: https://<user>.github.io/<repo>/#<id>
// (handy for a QR code on the apartment door).
//
// Each item:
//   id     – unique within the apartment (latin, no spaces)
//   emoji  – shown when there is no picture
//   img    – optional, path to a picture, e.g. "img/iron.webp" (see README)
//   title  – { ru: "...", en: "..." }
window.INVENTORY = {
  apartments: [
    {
      id: "apt-1",
      title: { ru: "Квартира 1", en: "Apartment 1" },
      items: [
        { id: "iron",        emoji: "👔", title: { ru: "Утюг",        en: "Iron" } },
        { id: "kettle",      emoji: "🫖", title: { ru: "Чайник",      en: "Kettle" } },
        { id: "multicooker", emoji: "🍲", title: { ru: "Мультиварка", en: "Multicooker" } },
        { id: "tv",          emoji: "📺", title: { ru: "Телевизор",   en: "TV" } },
        { id: "rug",         emoji: "🧞", title: { ru: "Ковёр",       en: "Rug" } },
        { id: "shoe-rack",   emoji: "👟", title: { ru: "Обувничка",   en: "Shoe rack" } },
      ],
    },
  ],
};
