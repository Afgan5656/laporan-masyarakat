import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Sistem Pengaduan Masyarakat',
  description: 'Platform pelaporan pengaduan masyarakat',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}