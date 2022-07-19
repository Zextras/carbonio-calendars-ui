/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import { concat, includes, isNil, map, omitBy } from 'lodash';
import moment from 'moment';
import { ROOM_DIVIDER } from '../../commons/body-message-renderer';
import { CRB_XPARAMS, CRB_XPROPS } from '../../constants/xprops';
import { Editor } from '../../types/editor';

type Participants = {
	a: string | undefined;
	p: string | undefined;
	t: string;
};

const setResourceDate = ({
	time,
	allDay = false,
	timezone
}: {
	time: number | undefined;
	allDay?: boolean;
	timezone?: string;
}): any => {
	if (allDay) {
		return timezone
			? {
					d: moment(time).startOf('day').format('YYYYMMDD'),
					tz: timezone
			  }
			: {
					d: moment(time).startOf('day').utc().format('YYYYMMDD'),
					tz: 'UTC'
			  };
	}
	return timezone
		? {
				d: moment(time).format('YYYYMMDD[T]HHmmss'),
				tz: timezone
		  }
		: {
				d: moment(time).utc().format('YYYYMMDD[T]HHmmss[Z]')
		  };
};

const generateParticipantInformation = (resource: Editor): Array<Participants> =>
	resource?.draft
		? [
				{
					a: resource?.organizer?.address,
					p: resource?.organizer?.fullName,
					t: 'f'
				}
		  ]
		: concat(
				map(concat(resource?.attendees, resource?.optionalAttendees), (attendee) => ({
					a: attendee?.email ?? attendee?.label,
					p:
						attendee?.firstName && attendee?.lastname
							? `${attendee.firstName} ${attendee.lastname}`
							: attendee.label,
					t: 't'
				})),
				{ a: resource?.organizer?.address, p: resource?.organizer?.fullName, t: 'f' }
		  );

function generateHtmlBodyRequest(app: Editor): any {
	const attendees = [...app.attendees, ...app.optionalAttendees].map((a) => a.email).join(', ');

	const date = app.allDay
		? moment(app.start).format('LL')
		: `${moment(app.start).format('LLLL')} - ${moment(app.end).format('LT')}`;

	const meetingHtml = `${ROOM_DIVIDER}<h3>${app.organizer.fullName} have invited you to a new meeting!</h3><p>Subject: ${app.title}</p><p>Organizer: ${app.organizer.fullName}</p><p>Location: ${app.location}</p><p>Time: ${date}</p><p>Invitees: ${attendees}</p><br/>${ROOM_DIVIDER}`;
	const virtualRoomHtml = app?.room?.label
		? `${ROOM_DIVIDER}<h3>${app.organizer.fullName} invited you to a virtual meeting on Carbonio Chats system.</h3><p>Join the meeting now on <a href="${app.room.link}">${app.room.label}</a></p><p>You can join the meeting via Web or by using native applications:</p><a href="https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US">https://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US</a><br/><a href="https://apps.apple.com/it/app/zextras-team/id1459844854">https://apps.apple.com/it/app/zextras-team/id1459844854</a><br/>${ROOM_DIVIDER}`
		: '';
	const defaultMessage =
		app?.room && !includes(app.richText, ROOM_DIVIDER) ? virtualRoomHtml : meetingHtml;
	return `<html><body id='htmlmode'>${defaultMessage}${app.richText}`;
}

function generateBodyRequest(app: Editor): any {
	const attendees = [...app.attendees, ...app.optionalAttendees].map((a) => a.email).join(', ');

	const date = app.allDay
		? moment(app.start).format('LL')
		: `${moment(app.start).format('LLLL')} - ${moment(app.end).format('LT')}`;

	const virtualRoomMessage = app?.room?.label
		? `-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-\n${
				app.organizer.fullName ?? ''
		  } have invited you to a virtual meeting on Carbonio Chats system!\n\nJoin the meeting now on ${
				app.room.label
		  }\n\n${
				app.room.link
		  } \n\nYou can join the meeting via Web or by using native applications:\n\nhttps://play.google.com/store/apps/details?id=com.zextras.team&hl=it&gl=US\n\nhttps://apps.apple.com/it/app/zextras-team/id1459844854\n\n-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::- \n`
		: '';
	const meetingMessage = `-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-\n${
		app.organizer.fullName ?? ''
	} have invited you to a new meeting!\n\nSubject: ${app.title} \nOrganizer: "${
		app.organizer.fullName
	} \n\nTime: ${date}\n \nInvitees: ${attendees} \n\n\n-:::_::_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_:_::_:_::-`;
	const defaultMessage = app?.room?.label ? virtualRoomMessage : meetingMessage;

	return `${defaultMessage}\n${app.plainText}`;
}

const generateMp = (msg: Editor): any => ({
	ct: 'multipart/alternative',
	mp: msg.isRichText
		? [
				{
					ct: 'text/html',
					content: generateHtmlBodyRequest(msg)
				},
				{
					ct: 'text/plain',
					content: generateBodyRequest(msg)
				}
		  ]
		: [
				{
					ct: 'text/plain',
					content: generateBodyRequest(msg)
				}
		  ]
});

const generateInvite = (editorData: Editor): any => {
	const at = [];
	at.push(
		...editorData.attendees.map((c: any) => ({
			// a: c.email,
			a: c.label,
			d: c?.firstName && c?.lastname ? `${c.firstName} ${c.lastname}` : c.label,
			role: 'REQ',
			ptst: 'NE',
			rsvp: '1'
		}))
	);
	editorData?.optionalAttendees &&
		at.push(
			...editorData.optionalAttendees.map((c: any) => ({
				a: c.email,
				d: c.firstName && c.lastname ? `${c.firstName} ${c.lastname}` : c.label,
				role: 'OPT',
				ptst: 'NE',
				rsvp: '1'
			}))
		);

	return {
		comp: [
			{
				alarm:
					editorData?.reminder !== 'never'
						? [
								{
									action: 'DISPLAY',
									trigger: {
										rel: {
											m: editorData.reminder,
											related: 'START',
											neg: '1'
										}
									}
								}
						  ]
						: undefined,
				xprop: editorData?.room
					? [
							{
								name: CRB_XPROPS.MEETING_ROOM,
								value: CRB_XPROPS.MEETING_ROOM,
								xparam: [
									{
										name: CRB_XPARAMS.ROOM_LINK,
										value: editorData.room.link
									},
									{
										name: CRB_XPARAMS.ROOM_NAME,
										value: editorData.room.label
									}
								]
							}
					  ]
					: undefined,
				at,
				allDay: editorData.allDay ? '1' : '0',
				fb: editorData.freeBusy,
				loc: editorData.location,
				name: editorData.title,
				or: {
					a: editorData.organizer.address,
					d: editorData.organizer.fullName
				},
				recur:
					(editorData?.isInstance && editorData?.isSeries) || editorData?.isException
						? undefined
						: editorData?.recur,
				status: 'CONF',
				s: setResourceDate({
					time: editorData.start,
					allDay: editorData?.allDay,
					timezone: editorData?.timezone
				}),
				e: setResourceDate({
					time: editorData.end,
					allDay: editorData?.allDay,
					timezone: editorData?.timezone
				}),
				exceptId: editorData.exceptId,
				class: editorData.class,
				draft: editorData.draft
			}
		],
		uid: editorData.uid
	};
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const generateSoapMessageFromEditor = (msg: Editor): any =>
	omitBy(
		{
			echo: msg?.isInstance ? '0' : '1',
			id: msg?.inviteId,
			comp: '0',
			m: omitBy(
				{
					attach: msg?.attachmentFiles
						? {
								mp: msg?.attachmentFiles?.mp,
								aid:
									msg?.attachmentFiles?.aid?.length > 0
										? msg?.attachmentFiles?.aid?.join(',')
										: undefined
						  }
						: undefined,
					e: generateParticipantInformation(msg),
					inv: generateInvite(msg),
					l: msg?.calendar?.id,
					mp: generateMp(msg),
					su: msg?.title
				},
				isNil
			),
			_jsns: 'urn:zimbraMail'
		},
		isNil
	);

export const createAppointment = createAsyncThunk(
	'appointment/create new appointment',
	async ({ id, draft }: any, { getState }: any): Promise<any> => {
		const editor = getState()?.editor?.editors?.[id];
		if (editor) {
			const body = generateSoapMessageFromEditor({ ...editor, draft });
			const res: { calItemId: string; invId: string } = await soapFetch('CreateAppointment', body);
			return {
				response: res,
				editor: {
					...editor,
					isNew: false,
					isSeries: !!editor.recur,
					isInstance: true,
					isException: false,
					inviteId: res.invId
				}
			};
		}
		return undefined;
	}
);
