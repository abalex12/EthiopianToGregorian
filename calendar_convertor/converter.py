from __future__ import absolute_import
from __future__ import division
from __future__ import unicode_literals
import datetime

class EthiopianDateConverter(object):
    @classmethod
    def _start_day_of_ethiopian(cls, year):
        new_year_day = (year // 100) - (year // 400) - 4
        if (year - 1) % 4 == 3:
            new_year_day += 1
        return new_year_day

    @classmethod
    def date_to_gregorian(cls, adate):
        return cls.to_gregorian(adate.year, adate.month, adate.day)

    @classmethod
    def date_to_ethiopian(cls, adate):
        return cls.to_ethiopian(adate.year, adate.month, adate.day)

    @classmethod
    def to_gregorian(cls, year, month, date):
        inputs = (year, month, date)
        if 0 in inputs or [data.__class__ for data in inputs].count(int) != 3:
            raise ValueError("Malformed input can't be converted.")

        new_year_day = cls._start_day_of_ethiopian(year)
        gregorian_year = year + 7
        gregorian_months = [0, 30, 31, 30, 31, 31, 28, 31, 30, 31, 30, 31, 31, 30]
        
        next_year = gregorian_year + 1
        if (next_year % 4 == 0 and next_year % 100 != 0) or next_year % 400 == 0:
            gregorian_months[6] = 29

        until = ((month - 1) * 30) + date
        if until <= 37 and year <= 1575:
            until += 28
            gregorian_months[0] = 31
        else:
            until += new_year_day - 1

        if year - 1 % 4 == 3:
            until += 1

        m = 0
        for i in range(0, gregorian_months.__len__()):
            if until <= gregorian_months[i]:
                m = i
                gregorian_date = until
                break
            else:
                m = i
                until -= gregorian_months[i]

        if m > 4:
            gregorian_year += 1

        order = [8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        gregorian_month = order[m]

        return datetime.date(gregorian_year, gregorian_month, gregorian_date)

    @classmethod
    def to_ethiopian(cls, year, month, date):
        """ Ethiopian date string representation of provided Gregorian date"""

        inputs = (year, month, date)
        if 0 in inputs or [data.__class__ for data in inputs].count(int) != 3:
            raise ValueError("Malformed input can't be converted.")

        
        if month == 10 and date >= 5 and date <= 14 and year == 1582:
            raise ValueError("Invalid Date between 5-14 May 1582.")

       
        gregorian_months = [0, 31, 28, 31, 30, 31, 30, \
                            31, 31, 30, 31, 30, 31]

        ethiopian_months = [0, 30, 30, 30, 30, 30, 30, 30, \
                            30, 30, 5, 30, 30, 30, 30]

        if  (year % 4 == 0 and year % 100 != 0) or year % 400 == 0:
            gregorian_months[2] = 29

        ethiopian_year = year - 8

        if ethiopian_year % 4 == 3:
            ethiopian_months[10] = 6
        else:
            ethiopian_months[10] = 5

        new_year_day = cls._start_day_of_ethiopian(year - 8)

        until = 0
        for i in range(1, month):
            until += gregorian_months[i]
        until += date

        if ethiopian_year % 4 == 0:
            tahissas = 26
        else:
            tahissas = 25

        if year < 1582:
            ethiopian_months[1] = 0
            ethiopian_months[2] = tahissas
        elif until <= 277 and year == 1582:
            ethiopian_months[1] = 0
            ethiopian_months[2] = tahissas
        else:
            tahissas = new_year_day - 3
            ethiopian_months[1] = tahissas

        m = 0
        for m in range(1, ethiopian_months.__len__()):
            if until <= ethiopian_months[m]:
                if m == 1 or ethiopian_months[m] == 0:
                    ethiopian_date = until + (30 - tahissas)
                else:
                    ethiopian_date = until
                break
            else:
                until -= ethiopian_months[m]

        if m > 10:
            ethiopian_year += 1

        order = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4]
        ethiopian_month = order[m]

        return ethiopian_year, ethiopian_month, ethiopian_date
