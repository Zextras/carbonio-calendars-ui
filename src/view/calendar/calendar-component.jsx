/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useContext, useEffect, useState } from 'react';
import moment from 'moment';
import { ThemeContext } from 'styled-components';
import { useAddBoardCallback, useUserAccount, useUserSettings } from '@zextras/carbonio-shell-ui';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { useDispatch, useSelector } from 'react-redux';
import { minBy } from 'lodash';
import { min as datesMin, max as datesMax } from 'date-arithmetic';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import CustomEvent from './custom-event';
import CustomEventWrapper from './custom-event-wrapper';
import CustomToolbar from './custom-toolbar';
import { WorkView } from './work-view';
import { workWeek } from '../../utils/work-week';
import { selectCheckedCalendars, selectEnd, selectStart } from '../../store/selectors/calendars';
import { selectAllAppointments } from '../../store/selectors/appointments';
import { setRange } from '../../store/slices/calendars-slice';
import { setSearchRange } from '../../store/actions/set-search-range';
import { normalizeCalendarEvents } from '../../normalizations/normalize-calendar-events';
import { CALENDAR_APP_ID, CALENDAR_ROUTE } from '../../constants';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { appointmentToEvent } from '../../hooks/use-invite-to-event';
import { getAppointmentAndInvite } from '../../store/actions/get-appointment';
import { modifyAppointmentRequest } from '../../store/actions/modify-appointment';
import { normalizeAppointmentFromCreation } from '../../normalizations/normalize-appointments';
import { useCalendarDate, useCalendarView } from '../../store/zustand/hooks';
import { useAppStatusStore } from '../../store/zustand/store';

const nullAccessor = () => null;
const BigCalendar = withDragAndDrop(Calendar);

const views = { month: true, week: true, day: true, work_week: WorkView };

const CalendarSyncWithRange = () => {
	const start = useSelector(selectStart);
	const end = useSelector(selectEnd);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(
			setSearchRange({
				rangeStart: start,
				rangeEnd: end
			})
		);
	}, [dispatch, end, start]);
	return null;
};

const customComponents = {
	toolbar: CustomToolbar,
	event: CustomEvent,
	eventWrapper: CustomEventWrapper
};

export default function CalendarComponent() {
	const appointments = useSelector(selectAllAppointments);
	const selectedCalendars = useSelector(selectCheckedCalendars);
	const dispatch = useDispatch();
	const theme = useContext(ThemeContext);
	const account = useUserAccount();
	const settings = useUserSettings();
	const addBoard = useAddBoardCallback();
	const calendarView = useCalendarView();
	const calendarDate = useCalendarDate();
	const timeZone = settings.prefs.zimbraPrefTimeZoneId;
	const firstDayOfWeek = settings.prefs.zimbraPrefCalendarFirstDayOfWeek ?? 0;
	const localizer = momentLocalizer(moment);
	if (settings.prefs.zimbraPrefLocale) {
		moment.updateLocale(settings.prefs.zimbraPrefLocale, {
			week: {
				dow: firstDayOfWeek
			}
		});
	}
	const workingSchedule = useMemo(() => workWeek(settings), [settings]);

	const events = useMemo(
		() => normalizeCalendarEvents(appointments, selectedCalendars),
		[appointments, selectedCalendars]
	);
	const startHour = useMemo(
		() =>
			Number(
				minBy(workingSchedule, (w) => w?.start)
					?.start?.split('')
					.splice(0, 2)
					.join('')
			),
		[workingSchedule]
	);

	const slotBgColor = (date) => {
		if (workingSchedule[moment(date).day()].working) {
			if (
				moment(date).tz(timeZone).format('HHmm') >= workingSchedule[moment(date).day()].start &&
				moment(date).tz(timeZone).format('HHmm') < workingSchedule[moment(date).day()].end
			) {
				return theme.palette.gray6.regular;
			}
			return theme.palette.gray5.regular;
		}
		return theme.palette.gray5.regular;
	};

	const slotDayBorderColor = (date) => {
		if (workingSchedule[moment(date).day()].working) {
			return theme.palette.gray3.regular;
		}
		return theme.palette.gray6.regular;
	};

	const slotPropGetter = (date) => ({
		style: {
			backgroundColor: slotBgColor(date),
			borderColor: `${theme.palette.gray3.regular}`,
			borderRight: `1px solid ${theme.palette.gray3.regular}`
		}
	});
	const dayPropGetter = (date) => ({
		style: {
			backgroundColor:
				// eslint-disable-next-line no-nested-ternary
				workingSchedule[moment(date).day()].working
					? moment().isSame(moment(date), 'day')
						? theme.palette.highlight.regular
						: theme.palette.gray6.regular
					: theme.palette.gray3.regular,
			borderBottom: `1px solid ${slotDayBorderColor(date)}`
		}
	});

	const onRangeChange = useCallback(
		(range) => {
			if (range.length) {
				const min = datesMin(...range);
				const max = datesMax(...range);
				dispatch(
					setRange({
						start: moment(min).startOf('day').valueOf(),
						end: moment(max).endOf('day').valueOf()
					})
				);
			} else {
				dispatch(
					setRange({
						start: moment(range.start).startOf('day').valueOf(),
						end: moment(range.end).endOf('day').valueOf()
					})
				);
			}
		},
		[dispatch]
	);

	const defaultView = useMemo(() => {
		if (calendarView) {
			return calendarView;
		}
		switch (settings.prefs.zimbraPrefCalendarInitialView) {
			case 'month':
				return 'month';
			case 'week':
				return 'week';
			case 'day':
				return 'day';
			default:
				return 'work_week';
		}
	}, [calendarView, settings?.prefs?.zimbraPrefCalendarInitialView]);

	const handleSelect = (e) => {
		addBoard(
			`/${CALENDAR_ROUTE}/edit?id=new&start=${new Date(e.start).getTime()}&end=${new Date(
				e?.end
			).getTime()}`,
			{
				app: CALENDAR_APP_ID
			}
		);
	};
	const onEventDrop = useCallback(
		(appt) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			dispatch(
				getAppointmentAndInvite({
					aptId: appt.event.resource.id,
					inviteId: appt.event.resource.inviteId
				})
			).then((res) => {
				const { appointment, invite } = res.payload;
				const normalizedAppointment = normalizeAppointmentFromCreation(appointment, {});
				const normalizedInvite = invite.inv[0].comp
					? normalizeInvite(invite)
					: normalizeInvite({ ...invite, inv: appointment.inv });
				const requiredEvent = appointmentToEvent(normalizedInvite, normalizedAppointment.id);

				dispatch(
					modifyAppointmentRequest({
						appt: requiredEvent,
						invite: normalizedInvite,
						id: 0,
						mailInvite: [{ comp: [{ s: [{ u: appt.start }], e: [{ u: appt.end }] }] }],
						account
					})
				);
			});
		},
		[dispatch, account]
	);
	const eventPropGetter = useCallback(
		(event) => ({
			style: {
				backgroundColor: event.resource.calendar.color.background,
				color: event.resource.calendar.color.color,
				boxSizing: 'border-box',
				margin: `0`,
				padding: `4px 8px`,
				borderRadius: `4px`,
				cursor: `pointer`,
				width: `100%`,
				textAlign: `left`,
				transition: `border 0.15s ease-in-out, background 0.15s ease-in-out`,
				boxShadow: `0px 0px 14px -8px rgba(0, 0, 0, 0.5)`,
				border: `1px solid ${event.resource.calendar.color.color}`
			}
		}),
		[]
	);

	const [date, setDate] = useState(calendarDate);

	const onNavigate = useCallback(
		(newDate) => {
			useAppStatusStore.setState((s) => ({ ...s, date: newDate }));
			return setDate(newDate);
		},
		[setDate]
	);

	return (
		<>
			<CalendarSyncWithRange />
			<BigCalendar
				selectable
				eventPropGetter={eventPropGetter}
				localizer={localizer}
				defaultView={defaultView}
				events={events}
				date={date}
				onNavigate={onNavigate}
				startAccessor="start"
				endAccessor="end"
				style={{ width: '100%' }}
				components={customComponents}
				views={views}
				tooltipAccessor={nullAccessor}
				onRangeChange={onRangeChange}
				dayPropGetter={dayPropGetter}
				slotPropGetter={slotPropGetter}
				workingSchedule={workingSchedule}
				onSelectSlot={(e) => handleSelect(e)}
				scrollToTime={new Date(0, 0, 0, startHour, -15, 0)}
				onEventDrop={onEventDrop}
				formats={{ eventTimeRangeFormat: () => '' }}
				draggableAccessor={(event) => event.resource.iAmOrganizer}
			/>
		</>
	);
}
