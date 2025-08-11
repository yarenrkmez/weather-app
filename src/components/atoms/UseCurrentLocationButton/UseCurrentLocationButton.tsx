import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGeolocation } from "hooks/useGeolocation";
import styles from "./UseCurrentLocationButton.module.scss";

type Props = { className?: string; to?: string };
const UseCurrentLocationButton: React.FC<Props> = ({
  className,
  to = "/city-details/Current",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    status,
    loading,
    errorKey: error,
    requestLocation,
  } = useGeolocation();

  const onClick = async () => {
    try {
      const pos = await requestLocation();
      navigate(`${to}?latitude=${pos.lat}&longitude=${pos.lon}`);
    } catch (_) {}
  };

  return (
    <div className={styles.useLocationBtn}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
      >
        {loading
          ? t("common.loading", "Yükleniyor...")
          : t("actions.use_current_location", "Mevcut konumumu kullan")}
      </button>
      {status === "denied" && (
        <small style={{ display: "block", opacity: 0.7 }}>
          {t(
            "errors.location_denied",
            "Konum izni reddedildi. Tarayıcı ayarlarından izin verin."
          )}
        </small>
      )}
      {error && status !== "denied" && (
        <small style={{ display: "block", color: "#d33" }}>
          {t("errors.location_failed", "Konum alınamadı.")}
        </small>
      )}
    </div>
  );
};

export default UseCurrentLocationButton;
