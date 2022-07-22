/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/extensions */
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { TFunction } from 'i18next';
import { Dispatch } from 'redux';
import { sendInviteResponse } from '../../store/actions/send-invite-response';

type ResponseAction = {
	inviteId: string;
	compNum: string;
	notifyOrganizer: boolean;
	action: string;
	dispatch: Dispatch;
	activeCalendar: any;
	t: TFunction;
	createSnackbar: any;
	parent: string;
};
export const sendResponse = ({
	inviteId,
	notifyOrganizer,
	action,
	compNum,
	dispatch,
	t,
	activeCalendar,
	createSnackbar,
	parent
}: ResponseAction): void => {
	dispatch(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		sendInviteResponse({
			inviteId,
			updateOrganizer: notifyOrganizer,
			action
		})
	).then((res: any): void => {
		if (res.type.includes('fulfilled')) {
			if (parent) {
				replaceHistory(`/folder/${parent}`);
			}
			const snackbarLabel =
				// eslint-disable-next-line no-nested-ternary
				action === 'ACCEPT'
					? t('message.snackbar.invite.accept', 'You’ve replied as Accepted')
					: action === 'TENTATIVE'
					? t('message.snackbar.invite.tentative', 'You’ve replied as Tentative')
					: t('message.snackbar.invite.decline', 'You’ve replied as Declined');

			if (action === 'ACCEPT' || action === 'TENTATIVE') {
				activeCalendar &&
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					activeCalendar?.zid !== '10' &&
					dispatch(
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore
						moveAppointment({ inviteId, l: activeCalendar?.zid || '10', fromMail: true })
					);
			}

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			createSnackbar({
				key: `invite_${action}`,
				replace: true,
				type: 'info',
				label: snackbarLabel,
				autoHideTimeout: 3000
			});
		} else {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			createSnackbar({
				key: `invite_${action}_error`,
				replace: true,
				type: 'error',
				label: t('label.error_try_again', 'Something went wrong, please try again'),
				autoHideTimeout: 3000
			});
		}
	});
};
