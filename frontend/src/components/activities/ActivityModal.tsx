import { Modal } from "../ui/Modal";
import { ActivityForm } from "./ActivityForm";
import { useUIStore } from "../../store/uiStore";

export const ActivityModal = () => {
  const { isActivityModalOpen, editingActivity, prefillDate, closeActivityModal } =
    useUIStore();

  return (
    <Modal
      isOpen={isActivityModalOpen}
      onClose={closeActivityModal}
      title={editingActivity ? "Editar actividad" : "Nueva actividad"}
      size="lg"
    >
      <ActivityForm
        activity={editingActivity}
        prefillDate={prefillDate}
        onSuccess={closeActivityModal}
      />
    </Modal>
  );
};
