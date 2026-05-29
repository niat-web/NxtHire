// client/src/layouts/PublicLayout.jsx
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PageTransition from '../components/common/PageTransition';
import Loader from '../components/common/Loader';

const RightPaneFallback = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <Loader size="lg" />
  </div>
);

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white antialiased">
      <Navbar />
      <main className="flex-grow pt-16">
        <PageTransition>
          {/* Local Suspense keeps navbar + footer mounted while a lazy page chunk loads */}
          <Suspense fallback={<RightPaneFallback />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
