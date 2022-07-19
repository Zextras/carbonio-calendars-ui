/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { store, getUserAccount, getUserSettings, replaceHistory } from '@zextras/carbonio-shell-ui';
import { find, startsWith } from 'lodash';
import moment from 'moment';
import { CALENDAR_PREFS_DEFAULTS } from '../constants/defaults';
import { createAppointment } from '../store/actions/new-create-appointment';
import { modifyAppointment } from '../store/actions/new-modify-appointment';
import {
	closeEditor,
	createNewEditor,
	editEditorAllDay,
	editEditorAttachments,
	editEditorAttendees,
	editEditorCalendar,
	editEditorClass,
	editEditorDate,
	editEditorDisplayStatus,
	editEditorLocation,
	editEditorOptionalAttendees,
	editEditorRecurrence,
	editEditorReminder,
	editEditorRoom,
	editEditorText,
	editEditorTimezone,
	editEditorTitle,
	editIsRichText,
	editOrganizer,
	updateEditor
} from '../store/slices/editor-slice';
import { Editor, EditorCallbacks, IdentityItem, Room } from '../types/editor';
import { EventResourceCalendar } from '../types/event';
import { Attendee, InviteClass, InviteFreeBusy } from '../types/store/invite';
import { getIdentityItems } from './get-identity-items';

let counter = 0;

const getNewEditId = (id: string): string => {
	counter += 1;
	return `${id}-${counter}`;
};

const createEmptyEditor = (id: string): Editor => {
	const identities = getIdentityItems();
	const {
		zimbraPrefTimeZoneId,
		zimbraPrefCalendarApptReminderWarningTime,
		zimbraPrefDefaultCalendarId = CALENDAR_PREFS_DEFAULTS.ZIMBRA_PREF_DEFAULT_CALENDAR_ID
	} = getUserSettings().prefs;
	const defaultOrganizer = find(identities, ['identityName', 'DEFAULT']);
	const calendars = store?.store?.getState().calendars;

	return {
		attach: undefined,
		calendar: calendars?.calendars?.[zimbraPrefDefaultCalendarId],
		isException: false,
		exceptId: undefined,
		isSeries: false,
		isInstance: false,
		isRichText: true,
		isNew: true,
		attachmentFiles: [],
		organizer: defaultOrganizer,
		title: '',
		location: '',
		room: undefined,
		attendees: [],
		optionalAttendees: [],
		allDay: false,
		freeBusy: 'B',
		class: 'PUB',
		start: moment().valueOf(),
		end: moment().valueOf() + 3600,
		inviteId: undefined,
		timezone: zimbraPrefTimeZoneId as string,
		reminder: zimbraPrefCalendarApptReminderWarningTime as string,
		recur: undefined,
		richText: '',
		plainText: '',
		id
	};
};

export const createCallbacks = (id: string): EditorCallbacks => {
	const { dispatch } = store.store;
	const account = getUserAccount();

	const onToggleRichText = (isRichText: boolean): void => {
		dispatch(editIsRichText({ id, isRichText }));
	};

	const onAttachmentsChange = (
		attach: any,
		attachmentFiles: any[]
	): { payload: { id: string; attach: any; attachmentFiles: any[] }; type: string } =>
		dispatch(
			editEditorAttachments({
				id,
				attach,
				attachmentFiles
			})
		);

	const onOrganizerChange = (
		organizer: IdentityItem
	): { payload: { id: string | undefined; organizer: IdentityItem }; type: string } =>
		dispatch(editOrganizer({ id, organizer }));

	const onSubjectChange = (
		title: string
	): { payload: { id: string | undefined; title: string }; type: string } =>
		dispatch(editEditorTitle({ id, title }));

	const onLocationChange = (
		location: string
	): { payload: { id: string | undefined; location: string }; type: string } =>
		dispatch(editEditorLocation({ id, location }));

	const onRoomChange = (
		room: Room
	): { payload: { id: string | undefined; room: Room }; type: string } =>
		dispatch(editEditorRoom({ id, room }));

	const onAttendeesChange = (
		attendees: Array<Attendee>
	): { payload: { id: string; attendees: Attendee[] }; type: string } =>
		dispatch(editEditorAttendees({ id, attendees }));

	const onOptionalAttendeesChange = (
		optionalAttendees: Array<Attendee>
	): { payload: { id: string; optionalAttendees: Attendee[] }; type: string } =>
		dispatch(editEditorOptionalAttendees({ id, optionalAttendees }));

	const onDisplayStatusChange = (
		freeBusy: InviteFreeBusy
	): { payload: { id: string; freeBusy: InviteFreeBusy }; type: string } =>
		dispatch(editEditorDisplayStatus({ id, freeBusy }));

	const onCalendarChange = (calendar: EventResourceCalendar): void => {
		const calResource = {
			id: calendar.id,
			name: calendar.name,
			color: calendar.color
		};
		const organizer = {
			email: calendar.owner ?? '',
			name: '',
			sentBy: account.name
		};
		const data = {
			id,
			calendar: calResource,
			organizer: calendar.isShared ? organizer : undefined
		};
		dispatch(editEditorCalendar(data));
	};

	const onPrivateChange = (
		isPrivate: InviteClass
	): { payload: { id: string | undefined; class: InviteClass }; type: string } =>
		dispatch(
			editEditorClass({
				id,
				class: isPrivate
			})
		);

	const onDateChange = ({
		start,
		end
	}: {
		start: number;
		end: number;
	}): { payload: { id: string | undefined; start: number; end: number }; type: string } =>
		dispatch(editEditorDate({ id, start, end }));

	const onTextChange = ([plainText, richText]: [plainText: string, richText: string]): {
		payload: { id: string | undefined; richText: string; plainText: string };
	} => dispatch(editEditorText({ id, richText, plainText }));

	const onAllDayChange = (
		allDay: boolean,
		start?: number,
		end?: number
	): {
		payload: {
			id: string | undefined;
			allDay: boolean;
			start?: number | undefined;
			end?: number | undefined;
		};
		type: string;
	} => dispatch(editEditorAllDay({ id, allDay, start, end }));

	const onTimeZoneChange = (timezone: string): any =>
		dispatch(editEditorTimezone({ id, timezone }));

	const onReminderChange = (reminder: string): any =>
		dispatch(editEditorReminder({ id, reminder }));

	const onRecurrenceChange = (
		recur: any
	): { payload: undefined; type: string } | { payload: { id: string; recur: any }; type: string } =>
		dispatch(editEditorRecurrence({ id, recur }));

	const closeCurrentEditor = (): { payload: { id: string }; type: string } => {
		replaceHistory('');
		return dispatch(closeEditor({ id }));
	};

	const onSave = ({
		draft = true,
		isNew = true
	}): any => // eslint-disable-next-line @typescript-eslint/ban-ts-comment
		isNew // @ts-ignore
			? dispatch(createAppointment({ id, draft })) // eslint-disable-next-line @typescript-eslint/ban-ts-comment
					.unwrap() // @ts-ignore
					.then(({ response, editor }) => {
						if (response) {
							dispatch(updateEditor({ id, editor }));
						}
						return Promise.resolve({ response, editor }); // eslint-disable-next-line @typescript-eslint/ban-ts-comment
					}) // @ts-ignore
			: dispatch(modifyAppointment({ id, draft })) // eslint-disable-next-line @typescript-eslint/ban-ts-comment
					.unwrap() // @ts-ignore
					.then(({ response, editor }) => {
						if (response) {
							dispatch(updateEditor({ id, editor }));
						}
						return Promise.resolve({ response, editor });
					});

	const onSend = (isNew: boolean): Promise<any> => onSave({ draft: false, isNew });

	return {
		onToggleRichText,
		onAttachmentsChange,
		onOrganizerChange,
		onSubjectChange,
		onLocationChange,
		onRoomChange,
		onAttendeesChange,
		onOptionalAttendeesChange,
		onDisplayStatusChange,
		onCalendarChange,
		onPrivateChange,
		onDateChange,
		onTextChange,
		onAllDayChange,
		onTimeZoneChange,
		onReminderChange,
		onRecurrenceChange,
		closeCurrentEditor,
		onSave,
		onSend
	};
};

export const generateEditor = (
	id: string,
	context = {},
	panel = true
): { editor: Editor; callbacks: EditorCallbacks } => {
	const editorId = getNewEditId(id);
	const emptyEditor = createEmptyEditor(editorId);
	const editor = { ...emptyEditor, ...context, isNew: startsWith(editorId, 'new') };
	const callbacks = createCallbacks(editorId);
	const { dispatch } = store.store;
	const storeEditorData = { ...editor, panel };
	dispatch(createNewEditor(storeEditorData));
	const storeData = store.store.getState();
	return { editor: storeData?.editor?.editors?.[editorId], callbacks };
};
