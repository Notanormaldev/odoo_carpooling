import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function GoogleSuccessHandler() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      loadUser().then(() => navigate('/'));
    } else {
      navigate('/login');
    }
  }, [params, navigate, loadUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader className="w-8 h-8 animate-spin text-[#e85d4a]" />
    </div>
  );
}
