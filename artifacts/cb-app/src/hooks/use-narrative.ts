import { 
  useGenerateNarrative as useGenNarrativeGenerated,
  useGetDemoBlocks as useDemoBlocksGenerated,
  type NarrativeRequest
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Wrappers around the generated API hooks to provide a clean interface
 * for the UI components and handle any local cache invalidations if necessary.
 */

export function useNarrative() {
  const mutation = useGenNarrativeGenerated();
  
  const generateNarrative = async (data: NarrativeRequest) => {
    return mutation.mutateAsync({ data });
  };

  return {
    generateNarrative,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset
  };
}

export function useDemoBlocks() {
  const query = useDemoBlocksGenerated();
  
  return {
    blocks: query.data || [],
    isLoading: query.isLoading,
    error: query.error
  };
}
