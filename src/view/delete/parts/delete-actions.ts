/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { isNil, omitBy } from 'lodash';
import { moveAppointmentToTrash } from '../../../store/actions/move-appointment-to-trash';
import { sendInviteResponse } from '../../../store/actions/send-invite-response';
import { EventType } from '../../../types/event';
import { Invite } from '../../../types/store/invite';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const generateSnackbar = ({ res, t, createSnackbar }: any): any => {
	if (!res.type.includes('fulfilled')) {
		createSnackbar({
			key: `delete`,
			replace: true,
			type: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000
		});
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const sendResponse = (event: EventType, invite: any, context: any): any =>
	context.dispatch(
		sendInviteResponse({
			inviteId: event.resource.inviteId,
			updateOrganizer: true,
			action: 'DECLINE',
			compNum: invite.compNum
		})
	);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const deleteEvent = (event: EventType, invite: Invite, context: any): any => {
	const { inviteId, id, isRecurrent, ridZ, iAmOrganizer } = event.resource;
	const moveToTrashArgs = omitBy(
		{
			inviteId,
			ridZ,
			t: context.t,
			recur: context?.recur,
			isRecurrent,
			isOrganizer: iAmOrganizer,
			deleteSingleInstance: context.isInstance ?? true,
			newMessage: context.newMessage,
			inst: context?.inst,
			s: context.s,
			id
		},
		isNil
	);
	return context.dispatch(moveAppointmentToTrash(moveToTrashArgs));
};
