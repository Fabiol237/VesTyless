import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-wa-bg border-t border-neutral-200/60 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-2xl font-bold tracking-widest text-wa-teal-dark uppercase mb-6">
              VESTYLE<span className="text-wa-teal">.</span>
            </h4>
            <p className="text-neutral-600 font-medium leading-relaxed max-w-sm mb-8">
              L&apos;excellence du commerce local. Trouvez, commandez et recevez les pièces les plus exclusives de votre ville.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-wa-teal hover:border-wa-teal hover:bg-wa-teal hover:text-white transition-colors shadow-sm">
                <span className="sr-only">Instagram</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </Link>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-bold text-wa-teal-dark mb-6 uppercase tracking-wider">Acheteurs</h5>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-neutral-600 hover:text-wa-teal transition-colors font-medium">Découvrir</Link></li>
              <li><Link href="#" className="text-sm text-neutral-600 hover:text-wa-teal transition-colors font-medium">Commander</Link></li>
              <li><Link href="#" className="text-sm text-neutral-600 hover:text-wa-teal transition-colors font-medium">Marques</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-bold text-wa-teal-dark mb-6 uppercase tracking-wider">Vendeurs</h5>
            <ul className="space-y-4">
              <li><Link href="/login" className="text-sm text-neutral-600 hover:text-wa-teal transition-colors font-medium">Édition Premium</Link></li>
              <li><Link href="/login" className="text-sm text-neutral-600 hover:text-wa-teal transition-colors font-medium">Ouvrir une vitrine</Link></li>
              <li><Link href="#" className="text-sm text-neutral-600 hover:text-wa-teal transition-colors font-medium">Avantages</Link></li>
            </ul>
          </div>

        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-neutral-200/50">
          <p className="text-xs text-neutral-500 font-medium">© 2026 Vestyle. L&apos;élégance préservée.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
             <Link href="#" className="text-xs text-neutral-500 hover:text-wa-teal transition-colors font-medium">Mentions légales</Link>
             <Link href="#" className="text-xs text-neutral-500 hover:text-wa-teal transition-colors font-medium">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

