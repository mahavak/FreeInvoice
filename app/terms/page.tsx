export const metadata = {
  title: 'Algemene Voorwaarden — FreeInvoice',
  description: 'Algemene voorwaarden van FreeInvoice.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-12">
        <h1 className="mb-8 text-4xl font-black tracking-tight">Algemene Voorwaarden</h1>
        <p className="mb-8 text-sm text-gray-500">Laatst bijgewerkt: mei 2026</p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">1. Toepasselijkheid</h2>
          <p className="text-gray-600 leading-relaxed">
            Deze voorwaarden zijn van toepassing op het gebruik van FreeInvoice, een online dienst voor het maken, beheren en versturen van facturen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">2. Abonnementen</h2>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
            <li><strong>Free:</strong> 3 facturen per maand, geen kosten</li>
            <li><strong>Pro:</strong> EUR 9/maand, 50 facturen per maand</li>
            <li><strong>Agency:</strong> EUR 29/maand, onbeperkte facturen</li>
          </ul>
          <p className="mt-3 text-gray-600">
            Alle prijzen zijn inclusief BTW waar van toepassing. Abonnementen kunnen maandelijks worden opgezegd.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">3. 1-for-3 Impact Model</h2>
          <p className="text-gray-600 leading-relaxed">
            Voor elk betaald Pro- of Agency-abonnement stelt FreeInvoice 3 gratis accounts beschikbaar voor freelancers in ontwikkelingslanden. Dit is onderdeel van onze sociale missie en geen verplichting jegens de gebruiker.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">4. Gebruiksvoorwaarden</h2>
          <ul className="list-disc pl-6 text-gray-600 leading-relaxed space-y-2">
            <li>U bent verantwoordelijk voor de juistheid van de informatie in uw facturen</li>
            <li>U mag de dienst niet gebruiken voor illegale doeleinden</li>
            <li>U mag uw accountgegevens niet delen met derden</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">5. Aansprakelijkheid</h2>
          <p className="text-gray-600 leading-relaxed">
            FreeInvoice levert de dienst &ldquo;as is&rdquo;. Wij zijn niet aansprakelijk voor indirecte schade, gemiste omzet, of gegevensverlies als gevolg van het gebruik of onbeschikbaarheid van de dienst. Onze totale aansprakelijkheid is beperkt tot het bedrag dat u in de afgelopen 12 maanden aan ons heeft betaald.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">6. Opzegging</h2>
          <p className="text-gray-600 leading-relaxed">
            U kunt uw abonnement te allen tijde opzeggen via het dashboard. Na opzegging behoudt u toegang tot het einde van de betaalde periode. Uw factuurgegevens worden 30 dagen na opzegging verwijderd, tenzij u anders aangeeft.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">7. Wijzigingen</h2>
          <p className="text-gray-600 leading-relaxed">
            Wij kunnen deze voorwaarden wijzigen. Bij wezenlijke wijzigingen informeren wij u per e-mail minimaal 30 dagen vooraf.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-bold">8. Toepasselijk recht</h2>
          <p className="text-gray-600 leading-relaxed">
            Op deze overeenkomst is Nederlands recht van toepassing.
          </p>
        </section>
      </div>
    </div>
  )
}