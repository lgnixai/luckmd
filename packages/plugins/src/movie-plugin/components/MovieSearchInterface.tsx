import React from 'react';
import { MovieSearchSidebar } from './MovieSearchSidebar';
import { MovieSearchResults } from './MovieSearchResults';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Movie } from '../api-service';

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      retry: 1,
    },
  },
});

export const MovieSearchInterface: React.FC = () => {
  const handleMovieClick = (movie: Movie) => {
    console.log('Movie clicked:', movie);
  };

  return (
    <QueryClientProvider client={queryClient}>
       
          <MovieSearchResults onMovieClick={handleMovieClick} />
       
    </QueryClientProvider>
  );
};

export default MovieSearchInterface;
