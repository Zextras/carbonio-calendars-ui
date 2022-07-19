/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isNil, omit } from 'lodash';
import { Editor, IdentityItem, Room } from '../../types/editor';
import { EventResourceCalendar } from '../../types/event';
import { Attendee, InviteClass, InviteFreeBusy } from '../../types/store/invite';
import { EditorSlice } from '../../types/store/store';

type OrganizerPayload = {
	payload: {
		id: string | undefined;
		organizer: IdentityItem;
	};
};

type TitlePayload = {
	payload: {
		id: string | undefined;
		title: string;
	};
};

type LocationPayload = {
	payload: {
		id: string | undefined;
		location: string;
	};
};

type RoomPayload = {
	payload: {
		id: string | undefined;
		room: Room;
	};
};

type CalendarPayload = {
	payload: {
		id: string;
		calendar: EventResourceCalendar;
		organizer: { email: string; name: string; sentBy: string } | undefined;
	};
};

type ClassPayload = {
	payload: {
		id: string | undefined;
		class: InviteClass;
	};
};

type TextPayload = {
	payload: {
		id: string | undefined;
		richText: string;
		plainText: string;
	};
};

type AllDayPayload = {
	payload: {
		id: string | undefined;
		allDay: boolean;
		start?: number;
		end?: number;
	};
};

type AttendeePayload = { payload: { id: string; attendees: Attendee[] }; type: string };

type OptionalAttendeePayload = {
	payload: { id: string; optionalAttendees: Attendee[] };
	type: string;
};

type FreeBusyPayload = {
	payload: { id: string; freeBusy: InviteFreeBusy };
};

type DateReducer = {
	payload: { id: string; start: number; end: number };
};

type IsRichTextPayload = {
	payload: { id: string; isRichText: boolean };
};

type AttachmentFilesPayload = {
	payload: { id: string; attach: any; attachmentFiles: any[] };
};

export const editIsRichTextReducer = (
	{ editors }: EditorSlice,
	{ payload }: IsRichTextPayload
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id]?.isRichText)) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].isRichText = payload.isRichText;
	}
};

export const editEditorAttachmentsReducer = (
	{ editors }: EditorSlice,
	{ payload }: AttachmentFilesPayload
): void => {
	if (payload?.id) {
		if (editors?.[payload?.id]?.attachmentFiles) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].attachmentFiles = [
				...editors[payload.id].attachmentFiles,
				payload.attachmentFiles
			];
		}
		if (editors?.[payload?.id]?.attach) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].attach = payload.attach;
		}
	}
};
export const editOrganizerReducer = (
	{ editors }: EditorSlice,
	{ payload }: OrganizerPayload
): void => {
	if (payload?.id && editors?.[payload?.id]?.organizer && payload?.organizer) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].organizer = payload.organizer;
	}
};

export const editTitleReducer = ({ editors }: EditorSlice, { payload }: TitlePayload): void => {
	if (payload?.id && !isNil(editors?.[payload?.id]?.title) && !isNil(payload?.title)) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].title = payload.title;
	}
};

export const editLocationReducer = (
	{ editors }: EditorSlice,
	{ payload }: LocationPayload
): void => {
	if (payload?.id && !isNil(editors?.[payload?.id]?.location) && !isNil(payload?.location)) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].location = payload.location;
	}
};

export const editEditorRoomReducer = ({ editors }: EditorSlice, { payload }: RoomPayload): void => {
	const { label, link, attendees } = payload.room;
	if (payload?.id) {
		if (label && link) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].room = { label, link };
		} else {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].room = undefined;
		}
		if (attendees) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].attendees = attendees;
		}
	}
};

export const editEditorAttendeesReducer = (
	{ editors }: EditorSlice,
	{ payload }: AttendeePayload
): void => {
	// eslint-disable-next-line no-param-reassign
	editors[payload.id].attendees = payload.attendees;
};

export const editEditorOptionalAttendeesReducer = (
	{ editors }: EditorSlice,
	{ payload }: OptionalAttendeePayload
): void => {
	// eslint-disable-next-line no-param-reassign
	editors[payload.id].optionalAttendees = payload.optionalAttendees;
};

export const editEditorDisplayStatusReducer = (
	{ editors }: EditorSlice,
	{ payload }: FreeBusyPayload
): void => {
	if (editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].freeBusy = payload.freeBusy;
	}
};

export const editEditorCalendarReducer = (
	{ editors }: EditorSlice,
	{ payload }: CalendarPayload
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].calendar = payload.calendar;
		if (payload.organizer) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].organizer = payload.organizer;
		}
	}
};

export const editEditorClassReducer = (
	{ editors }: EditorSlice,
	{ payload }: ClassPayload
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].class = payload.class;
	}
};

export const editEditorDateReducer = ({ editors }: EditorSlice, { payload }: DateReducer): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].start = payload.start;
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].end = payload.end;
	}
};

export const editEditorTextReducer = ({ editors }: EditorSlice, { payload }: TextPayload): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].richText = payload.richText;
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].plainText = payload.plainText;
	}
};

export const editEditorAllDayReducer = (
	{ editors }: EditorSlice,
	{ payload }: AllDayPayload
): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].allDay = payload.allDay;
		if (payload.start) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].start = payload.start;
		}
		if (payload.end) {
			// eslint-disable-next-line no-param-reassign
			editors[payload.id].end = payload.end;
		}
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const editEditorTimezoneReducer = ({ editors }: EditorSlice, { payload }: any): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].timezone = payload.timezone;
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const editEditorReminderReducer = ({ editors }: EditorSlice, { payload }: any): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].reminder = payload.reminder;
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const editEditorRecurrenceReducer = ({ editors }: EditorSlice, { payload }: any): void => {
	if (payload?.id && editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editors[payload.id].recur = payload.recur;
	}
};

export const closeEditorReducer = (
	editor: EditorSlice,
	{ payload }: { payload: { id: string } }
): void => {
	if (payload?.id && editor.editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editor.editors = omit(editor.editors, payload.id);
	}
};

export const updateEditorReducer = (
	editor: EditorSlice,
	{ payload }: { payload: { id: string; editor: Editor } }
): void => {
	if (payload?.id && editor?.editors?.[payload?.id]) {
		// eslint-disable-next-line no-param-reassign
		editor.editors[payload.id] = { ...editor.editors[payload.id], ...payload.editor };
	}
};
