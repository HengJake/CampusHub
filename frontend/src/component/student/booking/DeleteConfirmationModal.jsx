import ComfirmationMessage from "../../common/ComfirmationMessage"

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, bookingToDelete }) => {
    return (
        <ComfirmationMessage
            title="Delete Booking"
            description={`Are you sure you want to delete your booking for ${bookingToDelete?.resourceId?.name || 'this resource'}? This action cannot be undone.`}
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={onConfirm}
        />
    )
}

export default DeleteConfirmationModal
