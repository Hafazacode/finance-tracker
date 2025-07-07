import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
const config = {
  headers: {
    Authorization: `Bearer ${token_anda_dari_local_storage}`
  }
};

const { data } = await axios.get('/api/transactions', config);
const Welcome = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorField, setErrorField] = useState(null); // "username" | "password" | null

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username !== 'admin') {
      setErrorField('username');
      return;
    }

    if (password !== '1234') {
      setErrorField('password');
      return;
    }

    setErrorField(null);
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-500 to-gray-700 transition-all duration-500">
      <div className="flex flex-col md:flex-row w-full max-w-6xl shadow-xl rounded-xl overflow-hidden">
        {/* Left: Welcome Illustration */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-black via-gray-500 to-gray-700 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-white text-center p-6"
          >
            <h1 className="text-5xl font-bold tracking-widest">WELCOME</h1>
            <div className="mt-2 w-14 h-1 bg-white mx-auto"></div>
          </motion.div>
        </div>

        {/* Right: Login Form */}
        <div className="w-full md:w-1/2 bg-white p-10">
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-bold text-gray-700">Log In</h2>
            <p className="text-gray-500">Login your account to start the service</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-4 py-2 rounded-md border ${
                    errorField === 'username' ? 'border-red-500' : 'border-gray-300'
                  } bg-gray-100 focus:outline-none focus:ring-2 ${
                    errorField === 'username' ? 'focus:ring-red-400' : 'focus:ring-gray-400'
                  }`}
                />
                {errorField === 'username' && (
                  <p className="text-sm text-red-500 mt-1">Username salah</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-2 rounded-md border ${
                    errorField === 'password' ? 'border-red-500' : 'border-gray-300'
                  } bg-gray-100 focus:outline-none focus:ring-2 ${
                    errorField === 'password' ? 'focus:ring-red-400' : 'focus:ring-gray-400'
                  }`}
                />
                {errorField === 'password' && (
                  <p className="text-sm text-red-500 mt-1">Password salah</p>
                )}
              </div>

              <div
                onClick={() => navigate('/lupasandi')}
                className="text-right text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                Lupa sandi?
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full bg-gradient-to-r from-black via-gray-600 to-gray-700 rounded-md font-semibold shadow-md hover:opacity-90 transition text-white py-2"
              >
                Masuk
              </motion.button>
            </form>

            <div
              onClick={() => navigate('/register')}
              className="text-center text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Tidak punya akun? Daftar disini.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;