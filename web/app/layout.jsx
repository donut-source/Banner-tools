import './globals.css'

export const metadata = {
  title: 'Banner Pest Control — Analytics Dashboard',
  description: 'Business intelligence dashboard for Banner Pest Control',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  )
}
