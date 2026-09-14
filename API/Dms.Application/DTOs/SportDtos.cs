using System;
using System.Collections.Generic;

namespace Dms.Application.DTOs
{
    // ==================== TOURNAMENT DTOs ====================
    public class TournamentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public string? Status { get; set; }
        public bool IsActive { get; set; }
        public DateTime? Created { get; set; }
    }

    public class CreateUpdateTournamentDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Code { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Location { get; set; }
        public string? Status { get; set; } = "Upcoming";
        public bool IsActive { get; set; } = true;
    }

    // ==================== SPORT DTOs ====================
    public class SportDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Slug { get; set; }
        public bool IsActive { get; set; }
        public int? MatchDurationMinutes { get; set; }
        public int? NumberOfPeriods { get; set; }
        public int? PeriodDurationMinutes { get; set; }
        public int? BreakDurationMinutes { get; set; }
        public int? ExtraTimeDurationMinutes { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public DateTime? Created { get; set; }
    }

    public class CreateUpdateSportDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Slug { get; set; }
        public bool IsActive { get; set; } = true;
        public int? MatchDurationMinutes { get; set; }
        public int? NumberOfPeriods { get; set; }
        public int? PeriodDurationMinutes { get; set; }
        public int? BreakDurationMinutes { get; set; }
        public int? ExtraTimeDurationMinutes { get; set; }
        public int CategoryId { get; set; }
    }

    // ==================== TOURNAMENT SPORT DTOs ====================
    public class TournamentSportDto
    {
        public int Id { get; set; }
        public int TournamentId { get; set; }
        public string? TournamentName { get; set; }
        public int SportId { get; set; }
        public string? SportName { get; set; }
        public DateTime? Created { get; set; }
    }

    public class CreateTournamentSportDto
    {
        public int TournamentId { get; set; }
        public int SportId { get; set; }
    }

    // ==================== GROUP DTOs ====================
    public class GroupDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TournamentSportId { get; set; }
        public string? SportName { get; set; }
        public string? TournamentName { get; set; }
        public DateTime? Created { get; set; }
    }

    public class CreateUpdateGroupDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int TournamentSportId { get; set; }
    }

    // ==================== TEAM DTOs ====================
    public class TeamDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ShortName { get; set; }
        public string? Logo { get; set; }
        public string? CoachName { get; set; }
        public string? ContactPhone { get; set; }
        public string? DelegationName { get; set; }
        public int TournamentSportId { get; set; }
        public string? SportName { get; set; }
        public string? TournamentName { get; set; }
        public int? GroupId { get; set; }
        public string? GroupName { get; set; }
        public DateTime? Created { get; set; }
    }

    public class CreateUpdateTeamDto
    {
        public string Name { get; set; } = string.Empty;
        public string? ShortName { get; set; }
        public string? Logo { get; set; }
        public string? CoachName { get; set; }
        public string? ContactPhone { get; set; }
        public string? DelegationName { get; set; }
        public int TournamentSportId { get; set; }
        public int? GroupId { get; set; }
    }

    // ==================== ATHLETE DTOs ====================
    public class AthleteDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? AthleteCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Avatar { get; set; }
        public string? PhoneNumber { get; set; }
        public string? IdentityCardNumber { get; set; }
        public int? JerseyNumber { get; set; }
        public string? Position { get; set; }
        public int TournamentSportId { get; set; }
        public string? SportName { get; set; }
        public string? TournamentName { get; set; }
        public int? TeamId { get; set; }
        public string? TeamName { get; set; }
        public DateTime? Created { get; set; }
    }

    public class CreateUpdateAthleteDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? AthleteCode { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Avatar { get; set; }
        public string? PhoneNumber { get; set; }
        public string? IdentityCardNumber { get; set; }
        public int? JerseyNumber { get; set; }
        public string? Position { get; set; }
        public int TournamentSportId { get; set; }
        public int? TeamId { get; set; }
    }

    // ==================== MATCH DTOs ====================
    public class MatchDto
    {
        public int Id { get; set; }
        public string? MatchCode { get; set; }
        public string? Round { get; set; }
        public DateTime? ScheduledStartTime { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Location { get; set; }
        public string Status { get; set; } = "Scheduled";
        public int TournamentSportId { get; set; }
        public string? SportName { get; set; }
        public string? TournamentName { get; set; }
        public int? GroupId { get; set; }
        public string? GroupName { get; set; }
        public int? HomeTeamId { get; set; }
        public string? HomeTeamName { get; set; }
        public int? AwayTeamId { get; set; }
        public string? AwayTeamName { get; set; }
        public MatchResultDto? Result { get; set; }
        public DateTime? Created { get; set; }
    }

    public class CreateUpdateMatchDto
    {
        public string? MatchCode { get; set; }
        public string? Round { get; set; }
        public DateTime? ScheduledStartTime { get; set; }
        public DateTime? ActualStartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Location { get; set; }
        public string Status { get; set; } = "Scheduled";
        public int TournamentSportId { get; set; }
        public int? GroupId { get; set; }
        public int? HomeTeamId { get; set; }
        public int? AwayTeamId { get; set; }
    }

    // ==================== MATCH RESULT DTOs ====================
    public class MatchResultDto
    {
        public int Id { get; set; }
        public int MatchId { get; set; }
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public int? HomePenaltyScore { get; set; }
        public int? AwayPenaltyScore { get; set; }
        public int? WinningTeamId { get; set; }
        public string? WinningTeamName { get; set; }
        public bool IsDraw { get; set; }
        public string? Note { get; set; }
        public string? DetailJson { get; set; }
        public DateTime? Created { get; set; }
    }

    public class CreateUpdateMatchResultDto
    {
        public int MatchId { get; set; }
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public int? HomePenaltyScore { get; set; }
        public int? AwayPenaltyScore { get; set; }
        public int? WinningTeamId { get; set; }
        public bool IsDraw { get; set; } = false;
        public string? Note { get; set; }
        public string? DetailJson { get; set; }
    }
}
