import { ToastContainer } from 'react-toastify'

export const Toaster = () => {
  return (
    <ToastContainer
      autoClose={2500}
      closeOnClick
      draggable
      hideProgressBar
      icon={false}
      newestOnTop
      pauseOnFocusLoss
      pauseOnHover
      position={'bottom-left'}
      rtl={false}
      style={{ zIndex: 999999 }}
      theme={'colored'}
    />
  )
}
