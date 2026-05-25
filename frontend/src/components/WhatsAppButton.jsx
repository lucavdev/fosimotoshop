import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  const message = "Hola! Quiero consultar sobre";

  return (
    <a
      href={`https://wa.me/543865432517?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      style={styles.button}
    >
      <FaWhatsapp size={28} />
    </a>
  );
};

const styles = {
  button: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#25D366",
    color: "white",
    padding: "12px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
    zIndex: 1000
  }
};

export default WhatsAppButton;