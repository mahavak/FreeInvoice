export const metadata = {
  title: 'Contact — FreeInvoice',
  description: 'Neem contact op met FreeInvoice.',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-12">
        <h1 className="mb-8 text-4xl font-black tracking-tight">Contact</h1>

        <section className="mb-12">
          <h2 className="mb-3 text-xl font-bold">E-mail</h2>
          <p className="text-gray-600 leading-relaxed">
            Voor vragen, ondersteuning of feedback kunt u ons bereiken op:
          </p>
          <a
            href="mailto:support@freeinvoice.app"
            className="mt-2 inline-block text-lg font-bold text-indigo-600 hover:underline"
          >
            support@freeinvoice.app
          </a>
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-xl font-bold">Veelgestelde vragen</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900">Hoe kan ik opzeggen?</h3>
              <p className="text-gray-600">
            U kunt uw abonnement op elk moment opzeggen via het dashboard onder &ldquo;Manage Billing&rdquo;. U behoudt toegang tot het einde van de betaalde periode.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">Zijn mijn gegevens veilig?</h3>
              <p className="text-gray-600">
            Ja. Alle verbindingen zijn versleuteld via TLS, en uw factuurgegevens worden opgeslagen in een beveiligde database in een EU-datacenter. Wij delen uw gegevens niet met derden.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900">Wat is het 1-for-3 model?</h3>
              <p className="text-gray-600">
            Voor elk betaald abonnement stelt FreeInvoice 3 gratis accounts beschikbaar voor freelancers in ontwikkelingslanden. Zo maken we professionele facturering toegankelijk voor iedereen.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-3 text-xl font-bold">Respondstijd</h2>
          <p className="text-gray-600 leading-relaxed">
            Wij streven ernaar binnen 24 uur te reageren op werkdagen.
          </p>
        </section>
      </div>
    </div>
  )
}