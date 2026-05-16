export const metadata = {
  title: 'Privacybeleid — FreeInvoice',
  description: 'Privacybeleid van FreeInvoice. Hoe wij omgaan met uw persoonsgegevens.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-12">
        <h1 className="mb-8 text-4xl font-black tracking-tight">Privacybeleid</h1>
        <p className="mb-8 text-sm text-gray-500">Laatst bijgewerkt: mei 2026</p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">1. Wie zijn wij</h2>
          <p className="text-gray-600 leading-relaxed">
            FreeInvoice is een dienst voor het maken en beheren van facturen, gericht op zelfstandigen en kleine bedrijven in Nederland en daarbuiten.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">2. Welke gegevens verzamelen wij</h2>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
            <li><strong>Accountgegevens:</strong> naam, e-mailadres (via Google OAuth)</li>
            <li><strong>Factuurgegevens:</strong> klantinformatie, factuurregels, bedragen</li>
            <li><strong>Betalingsgegevens:</strong> verwerkt via Stripe; wij slaan geen betaalkaartgegevens op</li>
            <li><strong>Gebruiksgegevens:</strong> anonieme paginaweergaven en kliks voor verbetering van de dienst</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">3. Doel van gegevensverwerking</h2>
          <p className="text-gray-600 leading-relaxed">
            Wij verwerken uw gegevens uitsluitend om de FreeInvoice-dienst te leveren, facturen te genereren en te versturen, en uw abonnement te beheren.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">4. Bewaartermijn</h2>
          <p className="text-gray-600 leading-relaxed">
            Uw gegevens worden bewaard zolang uw account actief is. Na verwijdering van uw account bewaren wij gegevens maximaal 30 dagen, tenzij een langere bewaartermijn wettelijk vereist is (bijvoorbeeld fiscale verplichtingen).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">5. Delen met derden</h2>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
            <li><strong>Stripe:</strong> voor abonnementsbetalingen (zie stripe.com/privacy)</li>
            <li><strong>Google:</strong> voor authenticatie via OAuth (wij ontvangen alleen naam en e-mailadres)</li>
            <li><strong>Neon:</strong> voor database-hosting (EU-regio)</li>
          </ul>
          <p className="mt-3 text-gray-600">Wij verkopen uw gegevens nooit aan derden.</p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">6. Uw rechten (AVG/GDPR)</h2>
          <p className="text-gray-600 leading-relaxed">
            U heeft het recht op inzage, rectificatie, verwijdering en dataportabiliteit van uw persoonsgegevens. Neem contact op via onze contactpagina.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">7. Beveiliging</h2>
          <p className="text-gray-600 leading-relaxed">
            Wij gebruiken TLS-versleuteling voor alle verbindingen, en onze database is gehost in een EU-datacenter met versleutelde opslag.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">8. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            Voor vragen over dit privacybeleid kunt u contact opnemen via onze <a href="/contact" className="text-indigo-600 hover:underline">contactpagina</a>.
          </p>
        </section>
      </div>
    </div>
  )
}