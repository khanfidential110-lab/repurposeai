import { render, screen, waitFor } from '@testing-library/react';
import JobDetailPage from '@/app/(dashboard)/jobs/[id]/page';
import { useRouter, useParams } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(),
    useSearchParams: jest.fn(() => ({ get: jest.fn() })),
}));

// Mock fetch
global.fetch = jest.fn();

describe('JobDetailPage', () => {
    beforeEach(() => {
        (useParams as jest.Mock).mockReturnValue({ id: 'job_123' });
        (global.fetch as jest.Mock).mockClear();
    });

    it('renders loading state initially', () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            new Promise(() => { }) // Never resolves to keep loading state
        );

        render(<JobDetailPage />);
        // Check for loading spinner or text (you might need to adjust based on your actual Loader component)
        // Loader is a div with animate-spin class
        const loader = document.querySelector('.animate-spin');
        expect(loader).toBeInTheDocument();
    });

    it('renders job details after fetch', async () => {
        const mockJob = {
            id: 'job_123',
            inputFileName: 'test_video.mp4',
            status: 'done',
            createdAt: new Date().toISOString(),
            outputs: [
                { type: 'summary', content: '{"oneLiner": "Test Summary"}' } // Stringified JSON as it comes from DB
            ]
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: async () => ({ job: mockJob }),
        });

        render(<JobDetailPage />);

        await waitFor(() => {
            expect(screen.getByText('test_video.mp4')).toBeInTheDocument();
            expect(screen.getByText('Test Summary')).toBeInTheDocument();
        });
    });
});
