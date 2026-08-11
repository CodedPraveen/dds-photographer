export function upsertVisitorRecord(
  database,
  galleryId,
  visitorData,
  { id, timestamp },
) {
  let visitor = database.visitors.find(
    (candidate) =>
      candidate.galleryId === galleryId &&
      candidate.email === visitorData.email,
  );

  if (visitor) {
    Object.assign(visitor, visitorData, {
      galleryId,
      consent: true,
      consentedAt: timestamp,
      updatedAt: timestamp,
    });
  } else {
    visitor = {
      id,
      galleryId,
      ...visitorData,
      consent: true,
      consentedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    database.visitors.push(visitor);
  }

  return visitor;
}
