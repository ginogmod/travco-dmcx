export function seedReservations() {
  if (localStorage.getItem("reservations")) {
    console.log("🟡 Reservations already exist, skipping seeding");
    return;
  }

  fetch("/data/reservationDump.json")
    .then((res) => res.json())
    .then((data) => {
      localStorage.setItem("reservations", JSON.stringify(data));
      console.log("✅ Seeded 3000+ reservations into localStorage");
    })
    .catch((err) => console.error("❌ Failed to seed reservations:", err));
}
