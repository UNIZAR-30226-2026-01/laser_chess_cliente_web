export interface GameResume {
	id: number
	p1_id: number
	p2_id: number
	p1_elo: number
	p2_elo: number
	date: string
	winner: string
	termination: string
	match_type: string
	board: string
	movemente_history: string
	time_base: number
	time_increment: number
}