import { useToast } from "@chakra-ui/react";

const useToasts = () => {
  const toast = useToast();

  const showToast = (
    status,
    title,
    description,
    duration = 6000,
    isClosable = true
  ) =>
    toast({
      title,
      description,
      status,
      duration,
      isClosable,
    });

  return { showToast };
};

export default useToasts;
