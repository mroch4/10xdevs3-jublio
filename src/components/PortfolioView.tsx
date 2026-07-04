import { useAuth } from "../hooks/useAuth";

export default function PortfolioView() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="alert alert-info" role="alert">
        <h5 className="alert-heading">Sign in to view your portfolio</h5>
        <p className="mb-0">Your bookmarked dates will appear here after you sign in.</p>
      </div>
    );
  }

  return (
    <div className="alert alert-info" role="alert">
      <h5 className="alert-heading">Your Portfolio</h5>
      <p className="mb-0">This will show your bookmarked dates. (Phase 3 implementation pending)</p>
    </div>
  );
}
