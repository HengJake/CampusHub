// Programmer Name : Ritchie Boon Win Yew, Backend Developer
// Program Name: DeleteConfirmationModal.jsx
// Description: Confirmation modal for deleting bookings, providing user confirmation before removing booking records
// First Written on: July 22, 2024
// Edited on: Friday, August 2, 2024

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
