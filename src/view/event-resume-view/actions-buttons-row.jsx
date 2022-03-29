/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import styled from 'styled-components';
import {
	Button,
	Dropdown,
	Icon,
	ModalManagerContext,
	Padding,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import React, { useState, useCallback, useContext } from 'react';
import { map, toUpper } from 'lodash';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { sendInviteResponse } from '../../store/actions/send-invite-response';
import { updateParticipationStatus } from '../../store/slices/appointments-slice';
import { DeleteEventModal } from '../delete/delete-event-modal';

const AttendingRow = styled(Row)`
	border: 1px solid ${(props) => props.theme.palette[props.invtReply.color].regular};
`;

const ReplyButtonsPartSmall = ({ participationStatus, inviteId, compNum, dispatch }) => {
	const [t] = useTranslation();
	const decline = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action: 'DECLINE',
					compNum
				})
			).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'DE' })));
		},
		[dispatch, inviteId, compNum]
	);
	const tentative = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action: 'TENTATIVE',
					compNum
				})
			).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'TE' })));
		},
		[dispatch, inviteId, compNum]
	);
	const accept = useCallback(
		(ev) => {
			dispatch(
				sendInviteResponse({
					inviteId,
					updateOrganizer: false,
					action: 'ACCEPT',
					compNum
				})
			).then(() => dispatch(updateParticipationStatus({ inviteId, status: 'AC' })));
		},
		[dispatch, inviteId, compNum]
	);

	const attendeesOptions = [
		{
			id: 'option_2',
			icon: 'CheckmarkCircle2',
			label: toUpper(t('event.action.yes', 'Yes')),
			value: 'AC',
			action: accept,
			color: 'success',
			customComponent: (
				<Row>
					<Padding right="small">
						<Icon color="success" icon="CheckmarkCircle2" />
					</Padding>
					<Padding right="small">
						<Text>{toUpper(t('event.action.yes', 'Yes'))}</Text>
					</Padding>
				</Row>
			)
		},
		{
			id: 'option_3',
			icon: 'QuestionMarkCircle',
			label: toUpper(t('label.tentative', 'Tentative')),
			value: 'TE',
			action: tentative,
			color: 'warning',
			customComponent: (
				<Row>
					<Padding right="small">
						<Icon color="warning" icon="QuestionMarkCircle" />
					</Padding>
					<Padding right="small">
						<Text>{toUpper(t('label.tentative', 'Tentative'))}</Text>
					</Padding>
				</Row>
			)
		},
		{
			id: 'option_1',
			icon: 'CloseCircle',
			label: toUpper(t('event.action.no', 'No')),
			value: 'NO',
			action: decline,
			color: 'error',
			customComponent: (
				<Row>
					<Padding right="small">
						<Icon color="error" icon="CloseCircle" />
					</Padding>
					<Padding right="small">
						<Text>{toUpper(t('event.action.no', 'No'))}</Text>
					</Padding>
				</Row>
			)
		}
	];

	const attendingResponse = (value) => {
		switch (value) {
			case 'TE':
				return {
					id: 'option_3',
					icon: 'QuestionMarkCircle',
					label: toUpper(t('label.tentative', 'Tentative')),
					value: 'TE',
					action: '',
					color: 'warning',
					selected: false
				};
			case 'AC':
				return {
					id: 'option_2',
					icon: 'CheckmarkCircle2',
					label: toUpper(t('event.action.yes', 'Yes')),
					value: 'AC',
					action: '',
					color: 'success',
					selected: false
				};

			case 'DE':
				return {
					id: 'option_1',
					icon: 'CloseCircle',
					label: toUpper(t('event.action.no', 'No')),
					value: 'DE',
					action: '',
					color: 'error'
				};
			default:
				return {
					id: 'option_4',
					icon: 'CalendarWarning',
					label: toUpper(t('event.action.needs_action', 'Needs action')),
					value: 'NE',
					color: 'primary'
				};
		}
	};

	const [invtReply, setInvtReply] = useState(attendingResponse(participationStatus));

	return (
		<>
			<Dropdown
				disableAutoFocus
				items={map(attendeesOptions, (action) => ({
					id: action.label,
					icon: action.icon,
					label: action.label,
					key: action.id,
					color: action.color,
					customComponent: action.customComponent,
					click: (ev) => {
						ev.stopPropagation();
						action.action();
						setInvtReply(action);
					}
				}))}
				placement="bottom-end"
			>
				<AttendingRow padding={{ all: 'small' }} invtReply={invtReply}>
					<Padding right="small">
						<Icon color={invtReply.color} icon={invtReply.icon} />
					</Padding>
					<Padding right="small">
						<Text color={invtReply.color}>{invtReply.label}</Text>
					</Padding>
					<Icon color={invtReply.color} icon="ArrowIosDownwardOutline" />
				</AttendingRow>
			</Dropdown>
		</>
	);
};

export const ActionsButtonsRow = ({ event, dispatch, onClose }) => {
	const createModal = useContext(ModalManagerContext);
	const [t] = useTranslation();
	return (
		<Row width="fill" mainAlignment="flex-end" padding={{ all: 'small' }}>
			{event.resource.iAmOrganizer && event.haveWriteAccess ? (
				<>
					<Padding right="small">
						<Button
							type="outlined"
							color="error"
							label={t('label.delete', 'Delete')}
							onClick={(ev) => {
								if (ev) ev.stopPropagation();
								onClose();
								const closeModal = createModal(
									{
										onClose: () => {
											closeModal();
										},
										children: (
											<>
												<DeleteEventModal event={event} onClose={() => closeModal()} />
											</>
										)
									},
									true
								);
							}}
							disabled={!event.haveWriteAccess}
						/>
					</Padding>

					{event.resource?.calendar?.name === 'Trash' ? (
						<Button
							type="outlined"
							disabled={!event.permission}
							label={t('label.move', 'move')}
							onClick={() => console.warn('not implemented yet')}
						/>
					) : (
						<Button
							disabled={!event.haveWriteAccess}
							type="outlined"
							label={t('label.edit', 'edit')}
							onClick={(ev) => {
								if (ev) ev.stopPropagation();
								onClose();
								replaceHistory(
									`/${event.resource.calendar.id}/${EventActionsEnum.EDIT}/${event.resource.id}/${event.resource.ridZ}`
								);
							}}
						/>
					)}
				</>
			) : (
				<ReplyButtonsPartSmall
					inviteId={event.resource?.inviteId}
					participationStatus={event.resource?.participationStatus}
					compNum={event.resource?.compNum}
					dispatch={dispatch}
				/>
			)}
		</Row>
	);
};
