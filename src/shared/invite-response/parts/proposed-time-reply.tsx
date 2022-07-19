/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable import/extensions */
import React, { FC, ReactElement, useCallback, useContext } from 'react';
import {
	SnackbarManagerContext,
	Container,
	Padding,
	ButtonOld as Button,
	Divider
} from '@zextras/carbonio-design-system';
import { useIntegratedFunction, useUserAccounts } from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { normalizeInvite } from '../../../normalizations/normalize-invite';
import { appointmentToEvent } from '../../../hooks/use-invite-to-event';
import { getAppointmentAndInvite } from '../../../store/actions/get-appointment';
import { modifyAppointmentRequest } from '../../../store/actions/modify-appointment';
import { normalizeAppointmentFromCreation } from '../../../normalizations/normalize-appointments';

type ProposedTimeReply = {
	invite: any;
	id: string;
	inviteId: string;
	moveToTrash: () => void;
	title: string;
	fragment: string;
	to: { address: string; fullName: string; name: string; type: string };
};
const ProposedTimeReply: FC<ProposedTimeReply> = ({
	id,
	inviteId,
	invite: Invite,
	moveToTrash,
	title,
	fragment,
	to
}): ReactElement => {
	const createSnackbar = useContext(SnackbarManagerContext);
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const accounts = useUserAccounts();
	const [openComposer, available] = useIntegratedFunction('compose');
	const accept = useCallback(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		dispatch(getAppointmentAndInvite({ aptId: id, inviteId })).then((res) => {
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
					mailInvite: Invite,
					account: accounts[0]
				})
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
			).then((result) => {
				if (result.type.includes('fulfilled')) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: 'proposedTimeAccepted',
						replace: true,
						type: 'success',
						hideButton: true,
						label: t('snackbar.proposed_time_accepted', 'You accepted the proposed time'),
						autoHideTimeout: 3000
					});
				} else {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					createSnackbar({
						key: 'proposedTimeAccepted',
						replace: true,
						type: 'error',
						hideButton: true,
						label: t('label.error_try_again', 'Something went wrong, please try again'),
						autoHideTimeout: 3000
					});
				}
				moveToTrash();
			});
		});
	}, [dispatch, id, inviteId, Invite, accounts, moveToTrash, createSnackbar, t]);
	const decline = useCallback(() => {
		if (available)
			openComposer(null, {
				text: ['text', `${fragment}:`],
				subject: `${t('label.proposal_declined', 'Proposal declined')}${title}`,
				to
			});
	}, [available, openComposer, t, title, fragment, to]);
	return (
		<>
			<Padding top="small" />
			<Container
				orientation="horizontal"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="fill"
				height="fit"
				padding={{ top: 'medium' }}
			>
				<Button
					type="outlined"
					label={t('event.action.yes', 'yes')}
					icon="Checkmark"
					color="success"
					onClick={accept}
				/>
				<Padding horizontal="small" />
				<Button
					type="outlined"
					label={t('event.action.no', 'no')}
					icon="Close"
					color="error"
					onClick={decline}
				/>
				<Divider />
			</Container>
		</>
	);
};

export default ProposedTimeReply;
