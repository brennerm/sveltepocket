/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let superusers = app.findCollectionByNameOrId("_superusers")

  let record = new Record(superusers)

  record.set("email", "pocketbase@svelte.com")
  record.set("password", "pocketbase")

  app.save(record)
}, (app) => {
  try {
    let record = app.findAuthRecordByEmail("_superusers", "pocketbase@svelte.com")
    app.delete(record)
  } catch {
    // silent errors (probably already deleted)
  }
})