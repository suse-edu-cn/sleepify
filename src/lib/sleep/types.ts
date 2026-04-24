export type SleepStatusData =
    | {
          status: 0
      }
    | {
          status: 1
          start_time: string
          planned_end_time: string
      }
