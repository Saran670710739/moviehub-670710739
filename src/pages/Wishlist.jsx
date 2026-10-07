import { useEffect, useState } from 'react';
import MovieGrid from '../components/MovieGrid';
import { useAuth } from '../auth/AuthContext';
import { getWishlist } from '../api/backend';

function Wishlist() {
  const { member, token } = useAuth();

  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setMovies([]);
      setStatus('success');
      return;
    }

    let ignore = false;

    async function loadWishlist() {
      try {
        setStatus('loading');
        setError(null);

        const data = await getWishlist(token);

        if (!ignore) {
          setMovies(data.items || []);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }

    loadWishlist();

    return () => {
      ignore = true;
    };
  }, [token]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">

      <h1 className="text-2xl font-semibold text-slate-900">
        รายการที่อยากดูของ {member?.displayName}
      </h1>

      <p className="mb-6 text-sm text-slate-500">
        หนังที่คุณเพิ่มไว้ในรายการที่อยากดู
      </p>

      {status === 'error' && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          ไม่สามารถโหลดรายการที่อยากดูได้
          <br />
          {error?.message}
        </div>
      )}

      {status === 'success' && movies.length === 0 && (
        <div className="rounded-xl border border-emerald-100 bg-white p-8 text-center">
          <div className="text-5xl">🤍</div>

          <h2 className="mt-3 text-lg font-semibold text-slate-800">
            ยังไม่มีหนังในรายการที่อยากดู
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            ไปที่หน้าหนังแล้วกดปุ่ม ❤️ เพื่อเพิ่มหนัง
          </p>
        </div>
      )}

      <MovieGrid
        movies={movies}
        status={status}
        error={error}
      />

    </div>
  );
}

export default Wishlist;