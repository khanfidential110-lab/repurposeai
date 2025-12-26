import { isTokenExpired } from '@/lib/platforms/token-service';

describe('Token Service', () => {
    describe('isTokenExpired', () => {
        it('should return true for an expired token', () => {
            const expiredToken = {
                accessToken: 'expired',
                expiresAt: Date.now() - 10000, // Expired 10s ago
                tokenType: 'Bearer'
            };

            expect(isTokenExpired(expiredToken)).toBe(true);
        });

        it('should return true for a token about to expire (within buffer)', () => {
            const aboutToExpireToken = {
                accessToken: 'valid',
                expiresAt: Date.now() + (4 * 60 * 1000), // Expires in 4 mins (buffer is 5 mins)
                tokenType: 'Bearer'
            };

            expect(isTokenExpired(aboutToExpireToken)).toBe(true);
        });

        it('should return false for a valid token', () => {
            const validToken = {
                accessToken: 'valid',
                expiresAt: Date.now() + (60 * 60 * 1000), // Expires in 1 hour
                tokenType: 'Bearer'
            };

            expect(isTokenExpired(validToken)).toBe(false);
        });
    });
});
