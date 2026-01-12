// In-memory queue to track upload progress
type UploadJob = {
    matchId: string;
    status: 'processing' | 'completed' | 'error';
    total: number;
    processed: number;
    error?: string;
};

const jobs = new Map<string, UploadJob>();

export function createJob(matchId: string, total: number): void {
    jobs.set(matchId, {
        matchId,
        status: 'processing',
        total,
        processed: 0
    });
}

export function updateProgress(matchId: string, processed: number): void {
    const job = jobs.get(matchId);
    if (job) {
        job.processed = processed;
    }
}

export function completeJob(matchId: string): void {
    const job = jobs.get(matchId);
    if (job) {
        job.status = 'completed';
    }
}

export function failJob(matchId: string, error: string): void {
    const job = jobs.get(matchId);
    if (job) {
        job.status = 'error';
        job.error = error;
    }
}

export function getJob(matchId: string): UploadJob | undefined {
    return jobs.get(matchId);
}

export function deleteJob(matchId: string): void {
    jobs.delete(matchId);
}
