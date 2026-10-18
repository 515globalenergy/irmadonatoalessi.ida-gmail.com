import React, { useState } from 'react';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Percent,
  Plus,
  ExternalLink,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  Settings,
  Tag,
  Clock,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { ProductSaleItem, SaleTransaction, IrmaPaymentSettings, CategoryId } from '../types/agenda';
import { CATEGORIE_PREDEFINITE } from '../data/categoriesAndSeed';

interface VetrinaVenditeProps {
  products: ProductSaleItem[];
  transactions: SaleTransaction[];
  settings: IrmaPaymentSettings;
  onUpdateSettings: (newSettings: IrmaPaymentSettings) => void;
  onAddProduct: (product: ProductSaleItem) => void;
  onRecordSale: (transaction: SaleTransaction) => void;
}

export const VetrinaVendite: React.FC<VetrinaVenditeProps> = ({
  products,
  transactions,
  settings,
  onUpdateSettings,
  onAddProduct,
  onRecordSale,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [saleToast, setSaleToast] = useState<{ title: string; price: number; quotaIrma: number; pct: number } | null>(null);

  // New product form state
  const [titolo, setTitolo] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [prezzo, setPrezzo] = useState<number>(50);
  const [venditore, setVenditore] = useState('');
  const [percentualeIrma, setPercentualeIrma] = useState<number>(settings.percentualePredefinita);
  const [categoriaId, setCategoriaId] = useState<CategoryId>('artigianato');

  // Settings form state
  const [paypalInput, setPaypalInput] = useState(settings.paypalLink);
  const [whatsappInput, setWhatsappInput] = useState(settings.whatsappLink);
  const [defaultPctInput, setDefaultPctInput] = useState(settings.percentualePredefinita);

  // Calculations
  const totaleIncassatoIrma = transactions
    .filter((t) => t.stato === 'Completato')
    .reduce((sum, t) => sum + t.quotaIrmaIncassata, 0);

  const totaleVolumeVendite = transactions
    .filter((t) => t.stato === 'Completato')
    .reduce((sum, t) => sum + t.prezzoTotale, 0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo.trim() || prezzo <= 0) return;

    const newProd: ProductSaleItem = {
      id: `prod-${Date.now()}`,
      titolo: titolo.trim(),
      descrizione: descrizione.trim(),
      prezzo: Number(prezzo),
      venditore: venditore.trim() || 'Membro della Community',
      percentualeIrma: Number(percentualeIrma),
      categoriaId,
      disponibile: true,
      dataInserimento: new Date().toISOString().split('T')[0],
    };

    onAddProduct(newProd);
    setTitolo('');
    setDescrizione('');
    setPrezzo(50);
    setVenditore('');
    setShowAddModal(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      paypalLink: paypalInput.trim(),
      whatsappLink: whatsappInput.trim(),
      percentualePredefinita: Number(defaultPctInput),
    });
    setShowSettingsModal(false);
  };

  const handleSimulatePayment = (prod: ProductSaleItem, buyerName: string = 'Cliente del Tavolino') => {
    const quotaIrma = (prod.prezzo * prod.percentualeIrma) / 100;
    const quotaVenditore = prod.prezzo - quotaIrma;

    const newTx: SaleTransaction = {
      id: `tx-${Date.now()}`,
      prodottoId: prod.id,
      titoloProdotto: prod.titolo,
      prezzoTotale: prod.prezzo,
      percentualeIrma: prod.percentualeIrma,
      quotaIrmaIncassata: Number(quotaIrma.toFixed(2)),
      quotaVenditore: Number(quotaVenditore.toFixed(2)),
      venditore: prod.venditore,
      acquirente: buyerName,
      data: new Date().toISOString().split('T')[0],
      metodoPagamento: 'PayPal',
      stato: 'Completato',
    };

    onRecordSale(newTx);
    setSaleToast({
      title: prod.titolo,
      price: prod.prezzo,
      quotaIrma,
      pct: prod.percentualeIrma,
    });
  };

  // Generate WhatsApp order URL
  const getWhatsAppOrderUrl = (prod: ProductSaleItem) => {
    const quotaIrma = ((prod.prezzo * prod.percentualeIrma) / 100).toFixed(2);
    const msg = encodeURIComponent(
      `Salve Irma Donato Alessi,\ndesidero ordinare il prodotto "${prod.titolo}" (Prezzo: € ${prod.prezzo.toFixed(
        2
      )}) tramite la Community del Tavolino delle Competenze.\nVenditore: ${prod.venditore}.\nQuota percentuale riservata a Irma: € ${quotaIrma} (${prod.percentualeIrma}%).\nIn attesa di istruzioni per il pagamento.`
    );
    const cleanWa = settings.whatsappLink.trim().replace(/\/+$/, '');
    return `${cleanWa}?text=${msg}`;
  };

  // Generate PayPal payment URL
  const getPayPalPaymentUrl = (prod: ProductSaleItem) => {
    const cleanPaypal = settings.paypalLink.trim().replace(/\/+$/, '');
    // Standard paypal.me/User/Amount format
    return `${cleanPaypal}/${prod.prezzo}`;
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 tracking-wide uppercase">
              <span>Vetrina & Riconoscimento Percentuale</span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-900 dark:text-stone-100 font-bold">
                Community creata da Irma Donato Alessi
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              Tavolino delle Competenze · Sistema Vendite & Incassi
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 leading-relaxed font-serif-italian">
              Piattaforma commerciale etica ideata da <strong>Irma Donato Alessi</strong>: ogni membro della community può proporre manufatti d'arte, creazioni artigianali, corsi o consulenze specialistiche. Per ogni transazione conclusa viene versata e riconosciuta a Irma una quota percentuale tramite <strong>PayPal</strong> e <strong>WhatsApp</strong>.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <a
                href={settings.paypalLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 font-semibold hover:bg-blue-100 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Link PayPal Irma: {settings.paypalLink.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>

              <a
                href={settings.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 font-semibold hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Link WhatsApp Irma: {settings.whatsappLink.replace('https://', '')}</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300 dark:border-stone-700 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Configura Link & % Irma</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Inserisci Nuovo Prodotto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-500 text-stone-950 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="text-2xs font-extrabold uppercase tracking-wider text-stone-900/80 flex items-center justify-between">
            <span>Totale Percentuali Incassate</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold mt-1 tabular-nums">
            € {totaleIncassatoIrma.toFixed(2)}
          </div>
          <div className="text-2xs text-stone-900/90 font-medium mt-1">
            Incasso accreditato a Irma Donato Alessi
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Volume Totale Vendite
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 tabular-nums">
            € {totaleVolumeVendite.toFixed(2)}
          </div>
          <div className="text-2xs text-stone-400 mt-1">
            Prodotti e servizi venduti in community
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Transazioni Concluse
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
            {transactions.length}
          </div>
          <div className="text-2xs text-stone-400 mt-1">
            Ordini registrati nel ledger
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            Percentuale Predefinita
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 dark:text-blue-400 mt-1 tabular-nums">
            {settings.percentualePredefinita}%
          </div>
          <div className="text-2xs text-stone-400 mt-1">
            Quota royalty accordata sui prodotti
          </div>
        </div>
      </div>

      {/* Products Showcase Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
              <span>Prodotti & Competenze Disponibili nella Community ({products.length})</span>
            </h2>
            <p className="text-xs text-stone-500">
              Per ogni vendita effettuata, l'acquirente paga via PayPal o WhatsApp e la quota percentuale viene incassata da Irma Donato Alessi.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((prod) => {
            const cat = CATEGORIE_PREDEFINITE.find((c) => c.id === prod.categoriaId);
            const quotaIrma = ((prod.prezzo * prod.percentualeIrma) / 100).toFixed(2);
            const quotaVenditore = (prod.prezzo - (prod.prezzo * prod.percentualeIrma) / 100).toFixed(2);

            return (
              <div
                key={prod.id}
                className="bg-white dark:bg-stone-900 rounded-xl p-5 border border-stone-200 dark:border-stone-800 hover:border-amber-400 shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-semibold ${
                        cat?.badgeBg || 'bg-stone-100'
                      } ${cat?.badgeText || 'text-stone-700'}`}
                    >
                      {cat?.nome || prod.categoriaId}
                    </span>
                    <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                      € {prod.prezzo.toFixed(2)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {prod.titolo}
                  </h3>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Venditore: <strong className="text-stone-700 dark:text-stone-300">{prod.venditore}</strong>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
                    {prod.descrizione}
                  </p>

                  {/* Percentage Cut Breakdown Box */}
                  <div className="mt-4 p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-amber-900 dark:text-amber-200">
                      <span>Quota Incasso Irma Donato Alessi:</span>
                      <span className="tabular-nums font-bold">
                        € {quotaIrma} ({prod.percentualeIrma}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-2xs text-stone-500 dark:text-stone-400">
                      <span>Quota al Venditore Creatore:</span>
                      <span className="tabular-nums">€ {quotaVenditore}</span>
                    </div>
                  </div>
                </div>

                {/* Purchase Direct Action Buttons */}
                <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* PayPal Button */}
                    <a
                      href={getPayPalPaymentUrl(prod)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                      title="Paga con PayPal preimpostato per Irma"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>PayPal</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>

                    {/* WhatsApp Button */}
                    <a
                      href={getWhatsAppOrderUrl(prod)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                      title="Ordina e accordati direttamente con Irma via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>

                  {/* Quick Register Sale Button for Irma/Sellers */}
                  <button
                    onClick={() => handleSimulatePayment(prod)}
                    className="w-full py-1.5 px-2 text-2xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded transition-colors text-center cursor-pointer"
                  >
                    ✓ Registra Vendita Conclusa & Calcola %
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white dark:bg-stone-900 rounded-xl p-6 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Registro Storico Vendite & Percentuali Incassate da Irma
            </h3>
            <p className="text-xs text-stone-500">
              Rendiconto analitico delle provvigioni e vendite concluse tramite la community
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-50 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Prodotto / Servizio</th>
                <th className="py-2.5 px-3">Venditore</th>
                <th className="py-2.5 px-3">Acquirente</th>
                <th className="py-2.5 px-3 text-right">Prezzo Totale</th>
                <th className="py-2.5 px-3 text-right">% Irma</th>
                <th className="py-2.5 px-3 text-right">Incasso Irma</th>
                <th className="py-2.5 px-3 text-center">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-2.5 px-3 tabular-nums text-stone-500">{tx.data}</td>
                  <td className="py-2.5 px-3 font-semibold text-stone-900 dark:text-stone-100">
                    {tx.titoloProdotto}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600 dark:text-stone-400">{tx.venditore}</td>
                  <td className="py-2.5 px-3 text-stone-600 dark:text-stone-400">{tx.acquirente}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                    € {tx.prezzoTotale.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-700 dark:text-amber-400 font-semibold">
                    {tx.percentualeIrma}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold tabular-nums text-emerald-700 dark:text-emerald-400">
                    + € {tx.quotaIrmaIncassata.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-3xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {tx.stato}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Inserisci Nuovo Prodotto o Servizio nella Community
            </h3>
            <p className="text-xs text-stone-500">
              I membri che inseriscono prodotti concordano la percentuale da riconoscere a Irma Donato Alessi.
            </p>

            <form onSubmit={handleCreateProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Titolo Prodotto / Manufatto / Servizio
                </label>
                <input
                  type="text"
                  required
                  value={titolo}
                  onChange={(e) => setTitolo(e.target.value)}
                  placeholder="es. Borsa in Cuoio Fiorentino Lavorata a Mano"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Prezzo al Pubblico (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={prezzo}
                    onChange={(e) => setPrezzo(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Percentuale Irma Donato Alessi (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={percentualeIrma}
                    onChange={(e) => setPercentualeIrma(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Nome Venditore / Artigiano
                  </label>
                  <input
                    type="text"
                    required
                    value={venditore}
                    onChange={(e) => setVenditore(e.target.value)}
                    placeholder="es. Bottega Restauro / Nome Membro"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Categoria Predefinita
                  </label>
                  <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value as CategoryId)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
                  >
                    {CATEGORIE_PREDEFINITE.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Descrizione Caratteristiche e Autenticità
                </label>
                <textarea
                  rows={2}
                  value={descrizione}
                  onChange={(e) => setDescrizione(e.target.value)}
                  placeholder="Specifiche tecniche, origine dei materiali, certificati di garanzia..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs"
                >
                  Pubblica Prodotto in Vetrina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-600" />
              <span>Configura Link di Pagamento & Percentuali Irma Donato Alessi</span>
            </h3>
            <p className="text-xs text-stone-500">
              I link di PayPal e WhatsApp configurati qui saranno usati automaticamente per tutti i pulsanti d'acquisto e per l'incasso delle percentuali.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Link PayPal Personale Irma (paypal.me)
                </label>
                <input
                  type="text"
                  required
                  value={paypalInput}
                  onChange={(e) => setPaypalInput(e.target.value)}
                  placeholder="https://paypal.me/TuoNomeUtente"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
                />
                <p className="text-2xs text-stone-500 mt-1">
                  I clienti potranno inviarti direttamente la somma o la percentuale dovuta.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Link WhatsApp Diretto Irma (wa.me)
                </label>
                <input
                  type="text"
                  required
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  placeholder="https://wa.me/393471234567"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
                />
                <p className="text-2xs text-stone-500 mt-1">
                  Collegamento istantaneo per concordare ordini, percentuali e invio ricevute.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Percentuale Predefinita per i Nuovi Prodotti Inseriti (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={defaultPctInput}
                  onChange={(e) => setDefaultPctInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-xs"
                >
                  Salva Impostazioni
                </button>
              </div>
            </form>
          </div>
        </div>
      {/* Sale Confirmation Toast */}
      {saleToast && (
        <div className="fixed bottom-14 right-6 z-50 bg-stone-900 text-stone-100 p-4 rounded-xl shadow-2xl border border-amber-500/50 max-w-sm animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-xs text-white">Vendita Registrata con Successo!</div>
                <div className="text-2xs text-stone-300 mt-0.5">{saleToast.title}</div>
                <div className="text-2xs font-semibold text-amber-400 mt-1">
                  Totale: € {saleToast.price.toFixed(2)} · Quota Incassata da Irma: € {saleToast.quotaIrma.toFixed(2)} ({saleToast.pct}%)
                </div>
              </div>
            </div>
            <button
              onClick={() => setSaleToast(null)}
              className="text-stone-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
