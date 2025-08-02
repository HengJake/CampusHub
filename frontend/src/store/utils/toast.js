import { position, useToast } from "@chakra-ui/react";

export function useShowToast() {
  const toast = useToast();

  const showToast = ({
    title,
    description,
    status = "info", // "info", "success", "error", "warning"
    duration = 3000,
    isClosable = true,
    id,
  }) => {
    if (!id || !toast.isActive(id)) {
      toast({
        id,
        position: "top",
        title,
        description,
        status,
        duration,
        isClosable,
      });
    }
  };

  // Shortcuts for common types
  showToast.info = (title, description, id) =>
    showToast({ title, description, status: "info", id });
  showToast.success = (title, description, id) =>
    showToast({ title, description, status: "success", id });
  showToast.error = (title, description, id) =>
    showToast({ title, description, status: "error", id });

  return showToast;
}