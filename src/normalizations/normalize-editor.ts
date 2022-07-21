/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store } from '@zextras/carbonio-shell-ui';
import { filter, find, isNil, map, omitBy } from 'lodash';
import moment from 'moment';
import { extractHtmlBody, extractBody } from '../commons/body-message-renderer';
import { CALENDAR_PREFS_DEFAULTS } from '../constants/defaults';
import { CRB_XPARAMS, CRB_XPROPS } from '../constants/xprops';
import { Invite } from '../types/store/invite';
import { retrieveAttachmentsType } from './normalizations-utils';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getVirtualRoom = (xprop: any): { label: string; link: string } | undefined => {
	const room = find(xprop, ['name', CRB_XPROPS.MEETING_ROOM]);
	if (room) {
		return {
			label: find(room.xparam, ['name', CRB_XPARAMS.ROOM_NAME])?.value,
			link: find(room.xparam, ['name', CRB_XPARAMS.ROOM_LINK])?.value
		};
	}

	return undefined;
};

export const normalizeEditor = (
	id: string,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	invite: any,
	selectedStartTime: string,
	selectedEndTime: string,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	event: any
): any => ({
	title: event.title,
	start: invite.start.u ? invite.start.u : moment(invite.start.d).valueOf(),
	end: invite.end.u ? invite.end.u : moment(invite.end.d).valueOf(),
	startTimeZone: null,
	endTimeZone: null,
	allDay: event.allDay,

	resource: {
		recur: invite?.recurrenceRule?.[0] ?? undefined,
		tz: invite?.tz,
		meta: invite?.meta,
		attach: invite.attach,
		attachmentFiles: invite.attachmentFiles,
		parts: invite.parts,
		room: getVirtualRoom(invite?.xprop),
		attendees: filter(
			filter(invite.attendees, (p) => p.cutype !== 'RES'),
			(a) => a.role === 'REQ'
		).map((a) => ({
			email: a.a
		})),
		optionalAttendees: filter(
			filter(invite.attendees, (p) => p.cutype !== 'RES'),
			(a) => a.role === 'OPT'
		).map((a) => ({
			email: a.a
		})),
		alarmString: invite.alarmString ?? 'never',
		alarmValue: invite.alarmValue,
		id,
		idx: 0,
		iAmOrganizer: invite.isOrganizer,
		// can be deleted as we also have it outside resources
		start:
			event.allDay || !invite?.tz
				? {
						d: moment(event.start).utc().format('YYYYMMDD[T]HHmmss[Z]')
				  }
				: {
						d: moment(event.start).format('YYYYMMDD[T]HHmmss'),
						tz: invite?.tz
				  },
		// can be deleted as we also have it outside resources
		end:
			event.allDay || !invite?.tz
				? {
						d: moment(event.end).utc().format('YYYYMMDD[T]HHmmss[Z]')
				  }
				: {
						d: moment(event.end).format('YYYYMMDD[T]HHmmss'),
						tz: invite?.tz
				  },
		calendar: event.resource.calendar,
		status: event.resource.status,
		location: event?.resource?.location,
		organizer: event.resource.organizer,
		class: event.resource.class,
		inviteNeverSent: event.resource.neverSent,
		hasOtherAttendees: event.resource.hasOtherAttendees,
		hasAlarm: event.resource.alarm,
		fragment: event.resource.fragment,
		isRichText: !!invite.htmlDescription,
		richText: extractHtmlBody(invite.htmlDescription?.[0]._content) ?? '',
		plainText: extractBody(invite.textDescription?.[0]._content) ?? '',
		freeBusy: event.resource.freeBusy,
		inviteId: event.resource.inviteId,
		ms: event.resource.ms || undefined,
		rev: event.resource.rev || undefined,
		uid: invite.uid || undefined
	}
});

const getAttendees = (attendees: any[], role: string): any[] =>
	map(filter(attendees, ['role', role]), (at) =>
		omitBy(
			{
				company: undefined,
				email: at?.a,
				firstName: undefined,
				fullName: at?.d,
				id: `${at?.a} ${at.d}`,
				label: at?.d,
				lastName: undefined
			},
			isNil
		)
	);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const normalizeEditorFromInvite = (invite: Invite, context?: any): any =>
	omitBy(
		{
			calendar:
				store?.store?.getState().calendars.calendars[
					invite.ciFolder ?? CALENDAR_PREFS_DEFAULTS.ZIMBRA_PREF_DEFAULT_CALENDAR_ID
				],
			ridZ: context?.ridZ,
			attach: invite.attach,
			parts: invite.parts,
			attachmentFiles: invite.attachmentFiles,
			isInstance: context?.isInstance ?? false,
			isSeries: context?.isSeries ?? false,
			isException: invite?.isException ?? context?.isException ?? false,
			exceptId: invite?.exceptId,
			title: invite.name,
			location: invite.location,
			room: getVirtualRoom(invite.xprop),
			attendees: getAttendees(invite.attendees, 'REQ'),
			optionalAttendees: getAttendees(invite.attendees, 'OPT'),
			allDay: invite.allDay ?? false,
			freeBusy: invite.freeBusy,
			class: invite.class,
			start: invite?.allDay ? moment(invite?.date)?.startOf('date').valueOf() : invite?.start?.u,
			end: invite?.allDay ? moment(invite?.date)?.endOf('date').valueOf() : invite?.end?.u,
			timezone: invite?.start?.tz,
			inviteId: invite.id,
			reminder: invite?.alarmValue,
			recur: invite.recurrenceRule,
			richText: invite?.htmlDescription[0]._content ?? '',
			plainText: invite?.textDescription[0]._content ?? ''
		},
		isNil
	);
