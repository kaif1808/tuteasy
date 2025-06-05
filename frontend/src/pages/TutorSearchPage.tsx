import React, { useState, useEffect, useCallback } from 'react';
import { SearchService } from '../services/searchService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select, SelectItem, SelectValue } from '../components/ui/Select';
import { MultiSelect } from '../components/ui/MultiSelect';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import type {
  TutorSearchParams,
  TutorSearchResult,
  SearchPagination,
} from '../types/search';
import type { MultiSelectOption } from '../components/ui/MultiSelect';
import { QUALIFICATION_LEVELS, SORT_OPTIONS, AVAILABILITY_OPTIONS } from '../types/search';

export const TutorSearchPage: React.FC = () => {
  // Search state
  const [searchParams, setSearchParams] = useState<TutorSearchParams>({
    page: 1,
    limit: 12,
    sortBy: 'relevance',
    sortOrder: 'desc',
  });

  // Results state
  const [results, setResults] = useState<TutorSearchResult[]>([]);
  const [pagination, setPagination] = useState<SearchPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter options
  const [availableSubjects, setAvailableSubjects] = useState<MultiSelectOption[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Form state
  const [keywords, setKeywords] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Load available filter options on component mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoadingFilters(true);
        const response = await SearchService.getFilterOptions();
        if (response.success) {
          setAvailableSubjects(
            response.data.subjects.map(subject => ({
              value: subject,
              label: subject,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Search function
  const performSearch = useCallback(async (params: TutorSearchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await SearchService.searchTutors(params);
      
      if (response.success) {
        setResults(response.data.tutors);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to search tutors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search form submission
  const handleSearch = () => {
    const newParams: TutorSearchParams = {
      ...searchParams,
      keywords: keywords.trim() || undefined,
      subjects: selectedSubjects.length > 0 ? selectedSubjects : undefined,
      levels: selectedLevels.length > 0 ? selectedLevels : undefined,
      availability: selectedAvailability.length > 0 ? selectedAvailability : undefined,
      minRate: minRate ? Number(minRate) : undefined,
      maxRate: maxRate ? Number(maxRate) : undefined,
      sortBy: sortBy as TutorSearchParams['sortBy'],
      page: 1, // Reset to first page on new search
    };
    
    setSearchParams(newParams);
    performSearch(newParams);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newParams = { ...searchParams, page };
    setSearchParams(newParams);
    performSearch(newParams);
  };

  // Handle sort change
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const newParams = { ...searchParams, sortBy: newSortBy as TutorSearchParams['sortBy'], page: 1 };
    setSearchParams(newParams);
    performSearch(newParams);
  };

  // Format price range for display
  const formatPriceRange = (min: number | null, max: number | null) => {
    if (min && max) {
      return `£${min} - £${max}/hour`;
    } else if (min) {
      return `From £${min}/hour`;
    } else if (max) {
      return `Up to £${max}/hour`;
    }
    return 'Price on request';
  };

  // Clear all filters
  const clearFilters = () => {
    setKeywords('');
    setSelectedSubjects([]);
    setSelectedLevels([]);
    setSelectedAvailability([]);
    setMinRate('');
    setMaxRate('');
    setSortBy('relevance');
    const newParams: TutorSearchParams = {
      page: 1,
      limit: 12,
      sortBy: 'relevance',
      sortOrder: 'desc',
    };
    setSearchParams(newParams);
    performSearch(newParams);
  };

  // Initial search on component mount
  useEffect(() => {
    performSearch(searchParams);
  }, [performSearch, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find a Tutor</h1>
          <p className="text-gray-600">
            Search through our verified tutors to find the perfect match for your learning needs
          </p>
        </div>

        {/* Search Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-4">
              {/* Keywords Search */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keywords
                </label>
                <Input
                  type="text"
                  placeholder="Search by name, bio, qualifications..."
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>

              {/* Subjects Filter */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subjects
                </label>
                <MultiSelect
                  options={availableSubjects}
                  value={selectedSubjects}
                  onChange={setSelectedSubjects}
                  placeholder="Select subjects..."
                  disabled={loadingFilters}
                />
              </div>

              {/* Qualification Levels Filter */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification Levels
                </label>
                <MultiSelect
                  options={QUALIFICATION_LEVELS.map(level => ({
                    value: level.value,
                    label: level.label,
                  }))}
                  value={selectedLevels}
                  onChange={setSelectedLevels}
                  placeholder="Select levels..."
                />
              </div>
              
              {/* Availability Filter */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <MultiSelect
                  options={AVAILABILITY_OPTIONS}
                  value={selectedAvailability}
                  onChange={setSelectedAvailability}
                  placeholder="Select availability..."
                />
              </div>

              {/* Price Range Filter */}
              <div className="lg:col-span-2 flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (£/hour)
                  </label>
                  <Input
                    type="number"
                    placeholder="Min rate"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    min="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (£/hour)
                  </label>
                  <Input
                    type="number"
                    placeholder="Max rate"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Sort By */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectValue placeholder="Sort by..." />
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search Tutors'}
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={loading}
              >
                Clear Filters
              </Button>
            </div>

            {/* Active Filters Display */}
            {(selectedSubjects.length > 0 || selectedLevels.length > 0 || keywords.trim() || selectedAvailability.length > 0 || minRate || maxRate) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                {keywords.trim() && (
                  <Badge variant="secondary">Keywords: {keywords}</Badge>
                )}
                {selectedSubjects.map(subject => (
                  <Badge key={subject} variant="secondary">Subject: {subject}</Badge>
                ))}
                {selectedLevels.map(level => (
                  <Badge key={level} variant="secondary">Level: {level}</Badge>
                ))}
                {selectedAvailability.map(avail => (
                  <Badge key={avail} variant="secondary">{AVAILABILITY_OPTIONS.find(o => o.value === avail)?.label}</Badge>
                ))}
                {minRate && <Badge variant="secondary">Min Rate: £{minRate}</Badge>}
                {maxRate && <Badge variant="secondary">Max Rate: £{maxRate}</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Search Results */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <h3 className="font-medium mb-2">Search Error</h3>
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Header */}
        {pagination && (
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tutor Results Grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {results.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  {/* Tutor Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                      {tutor.profileImageUrl ? (
                        <img
                          src={tutor.profileImageUrl}
                          alt="Profile"
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold text-lg">
                          {tutor.user.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tutor.user.email}</h3>
                      <p className="text-sm text-gray-500">
                        {tutor.experienceYears} years experience
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={tutor.verificationStatus === 'VERIFIED' ? 'default' : 'secondary'}
                        >
                          {tutor.verificationStatus}
                        </Badge>
                        {tutor.rating > 0 && (
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm ml-1">{tutor.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {tutor.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {tutor.bio}
                    </p>
                  )}

                  {/* Subjects */}
                  <div className="mb-4">
                    <h4 className="font-medium text-sm mb-2">Subjects:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjects.slice(0, 3).map((subject) => (
                        <Badge key={subject.id} variant="outline" className="text-xs">
                          {subject.subjectName}
                        </Badge>
                      ))}
                      {tutor.subjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{tutor.subjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-blue-600">
                        {formatPriceRange(tutor.hourlyRateMin, tutor.hourlyRateMax)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tutor.totalStudents} students taught
                      </p>
                    </div>
                    <Button size="sm">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && !error && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tutors found
                </h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your search criteria or clearing some filters to find more results.
                </p>
                <Button onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            className="mt-8"
          />
        )}
      </div>
    </div>
  );
}; 