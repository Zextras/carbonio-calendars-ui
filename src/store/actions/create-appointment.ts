/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import { soapFetch } from '@zextras/carbonio-shell-ui';
import moment from 'moment';

function generateHtmlBodyRequest(
	app: {
		resource: { attendees: any; optionalAttendees: any; location: any; richText: any };
		allDay: any;
		start: moment.MomentInput;
		end: moment.MomentInput;
		title: any;
	},
	account: { displayName: any; name: any }
): any {
	const attendees = [...app.resource.attendees, ...app.resource.optionalAttendees]
		.map((a) => a.email)
		.join(', ');

	const date = app.allDay
		? moment(app.start).format('LL')
		: `${moment(app.start).format('LLLL')} - ${moment(app.end).format('LT')}`;

	const intro = 'The following is a new meeting request';

	return `<html><body id='htmlmode'><h3>${intro}:</h3>
<p>
<table border='0'>
<tr><th align=left>Subject:</th><td>${app.title}</td></tr>
<tr><th align=left>Organizer:</th><td>"${account.displayName}" <${account.name}> </td></tr>
</table>
<p>
<table border='0'>
<tr><th align=left>Location:</th><td>${app.resource.location} </td></tr>
<tr><th align=left>Time:</th><td> ${date}
 </td></tr></table>
<p>
<table border='0'>
<tr><th align=left>Invitees:</th><td>${attendees}</td></tr>
</table>
<div>*~*~*~*~*~*~*~*~*~*</div><br>${app.resource.richText}`;
}

function generateBodyRequest(
	app: {
		resource: { attendees: any; optionalAttendees: any; plainText: any };
		allDay: any;
		start: moment.MomentInput;
		end: moment.MomentInput;
		title: any;
	},
	account: { displayName: any; name: any }
): any {
	const attendees = [...app.resource.attendees, ...app.resource.optionalAttendees]
		.map((a) => a.email)
		.join(', ');

	const date = app.allDay
		? moment(app.start).format('LL')
		: `${moment(app.start).format('LLLL')} - ${moment(app.end).format('LT')}`;

	const intro = 'The following is a new meeting request';

	return `${intro}:\n\nSubject: ${app.title} \nOrganizer: "${account.displayName}" <${account.name}>\n\nTime: ${date}\n \nInvitees: ${attendees} \n\n\n*~*~*~*~*~*~*~*~*~*\n\n${app.resource.plainText}`;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const retrieveParticipantEmailInformation = (attendees: any, draft: boolean): any =>
	draft
		? []
		: attendees.map((attendee: { a: any }) => ({
				a: attendee.a,
				t: 't'
		  }));

export const createAppointment = createAsyncThunk(
	'appointment/create new appointment',
	async ({ editorData, id, account, draft }: any): Promise<{ resp: any; id: any }> => {
		const at = [];
		at.push(
			...editorData.resource.attendees.map((c: { email: any }) => ({
				a: c.email,
				role: 'REQ',
				ptst: 'NE'
			}))
		);
		at.push(
			...editorData.resource.optionalAttendees.map((c: { email: any }) => ({
				a: c.email,
				role: 'OPT',
				ptst: 'NE'
			}))
		);

		const resp = await soapFetch('CreateAppointment', {
			echo: '1',
			m: {
				attach: editorData.resource.attach
					? {
							mp: editorData.resource.attach?.mp,
							aid:
								editorData.resource.attach?.aid?.length > 0
									? editorData.resource.attach?.aid?.join(',')
									: null
					  }
					: null,
				su: editorData.title,
				l: editorData.resource.calendarId,
				e: retrieveParticipantEmailInformation(editorData.resource.attendees, draft),
				inv: {
					comp: [
						{
							alarm:
								editorData.resource.alarm !== 'never'
									? [
											{
												action: 'DISPLAY',
												trigger: {
													rel: {
														m: editorData.resource.alarm,
														related: 'START',
														neg: '1'
													}
												}
											}
									  ]
									: undefined,
							at,
							allDay: editorData.allDay ? '1' : '0',
							fb: editorData.resource.freeBusy,
							loc: editorData.resource.location,
							name: editorData.title,
							or: {
								a: editorData.resource.organizer.email,
								d: editorData.resource.organizer.name,
								sentBy: editorData.resource.organizer?.sentBy
							},
							recur: editorData?.resource?.recur ?? null,
							status: editorData.resource.status,
							s: editorData.startTimeZone
								? {
										tz: editorData.startTimeZone,
										d: moment(editorData.resource.apptStart).utc().format('YYYYMMDD[T]HHmmss')
								  }
								: {
										d: moment(editorData.resource.apptStart).utc().format('YYYYMMDD[T]HHmmss[Z]')
								  },
							e: editorData.startTimeZone
								? {
										tz: editorData.startTimeZone,
										d: moment(editorData.end).utc().format('YYYYMMDD[T]HHmmss')
								  }
								: {
										d: moment(editorData.end).utc().format('YYYYMMDD[T]HHmmss[Z]')
								  },
							class: editorData.resource.class,
							draft
						}
					],
					uid: editorData.resource.uid
				},
				mp: {
					ct: 'multipart/alternative',
					mp: editorData.resource.isRichText
						? [
								{
									ct: 'text/html',
									content: generateHtmlBodyRequest(editorData, account)
								},
								{
									ct: 'text/plain',
									content: generateBodyRequest(editorData, account)
								}
						  ]
						: [
								{
									ct: 'text/plain',
									content: generateBodyRequest(editorData, account)
								}
						  ]
				}
			},
			_jsns: 'urn:zimbraMail'
		});

		return { resp, id };
	}
);
