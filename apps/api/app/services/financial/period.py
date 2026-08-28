from dataclasses import dataclass
from datetime import date, timedelta
import calendar
from typing import Optional

@dataclass
class FinancialPeriod:
    start_date: date
    end_date: date
    previous_start_date: date
    previous_end_date: date
    days_count: int

    @classmethod
    def create_for_month(cls, target_date: Optional[date] = None) -> "FinancialPeriod":
        """Creates a period for the full month of the target_date (defaulting to today) and compares with previous month."""
        current = target_date or date.today()
        
        curr_start = date(current.year, current.month, 1)
        _, last_day_curr = calendar.monthrange(current.year, current.month)
        curr_end = date(current.year, current.month, last_day_curr)
        
        if current.month == 1:
            prev_year = current.year - 1
            prev_month = 12
        else:
            prev_year = current.year
            prev_month = current.month - 1
            
        prev_start = date(prev_year, prev_month, 1)
        _, last_day_prev = calendar.monthrange(prev_year, prev_month)
        prev_end = date(prev_year, prev_month, last_day_prev)
        
        days_count = (curr_end - curr_start).days + 1

        return cls(
            start_date=curr_start,
            end_date=curr_end,
            previous_start_date=prev_start,
            previous_end_date=prev_end,
            days_count=days_count
        )

    @classmethod
    def create_for_week(cls, target_date: Optional[date] = None) -> "FinancialPeriod":
        """Creates a 7-day period starting Monday and compares with the preceding 7 days."""
        current = target_date or date.today()
        start = current - timedelta(days=current.weekday())  # Monday
        end = start + timedelta(days=6)  # Sunday
        
        prev_end = start - timedelta(days=1)
        prev_start = prev_end - timedelta(days=6)
        
        return cls(
            start_date=start,
            end_date=end,
            previous_start_date=prev_start,
            previous_end_date=prev_end,
            days_count=7
        )

    @classmethod
    def create_for_year(cls, year: Optional[int] = None) -> "FinancialPeriod":
        """Creates a 1-year period and compares with the previous calendar year."""
        target_year = year or date.today().year
        start = date(target_year, 1, 1)
        end = date(target_year, 12, 31)
        
        prev_start = date(target_year - 1, 1, 1)
        prev_end = date(target_year - 1, 12, 31)
        days = (end - start).days + 1

        return cls(
            start_date=start,
            end_date=end,
            previous_start_date=prev_start,
            previous_end_date=prev_end,
            days_count=days
        )

    @classmethod
    def create_custom(cls, start_date: date, end_date: date) -> "FinancialPeriod":
        """Creates custom period and matching previous duration."""
        days = (end_date - start_date).days + 1
        prev_end = start_date - timedelta(days=1)
        prev_start = prev_end - timedelta(days=days - 1)
        
        return cls(
            start_date=start_date,
            end_date=end_date,
            previous_start_date=prev_start,
            previous_end_date=prev_end,
            days_count=days
        )

    @classmethod
    def from_preset(
        cls,
        preset: str = "this_month",
        start_date: Optional[date] = None,
        end_date: Optional[date] = None
    ) -> "FinancialPeriod":
        """Factory for period presets: this_month, last_month, this_week, this_year, custom."""
        today = date.today()
        
        if preset == "this_week":
            return cls.create_for_week(today)
        elif preset == "last_month":
            first_of_this_month = date(today.year, today.month, 1)
            last_of_prev_month = first_of_this_month - timedelta(days=1)
            return cls.create_for_month(last_of_prev_month)
        elif preset == "this_year":
            return cls.create_for_year(today.year)
        elif preset == "custom" and start_date and end_date:
            return cls.create_custom(start_date, end_date)
        elif start_date and end_date:
            return cls.create_custom(start_date, end_date)
        else:
            return cls.create_for_month(today)
