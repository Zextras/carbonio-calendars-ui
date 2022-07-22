/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable import/extensions */
import React, { FC, ReactElement, useMemo, useEffect, useCallback, useState } from 'react';
import {
	Container,
	Row,
	Icon,
	Text,
	Divider,
	Tooltip,
	Chip
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import moment from 'moment';
import 'moment-timezone';
import { useTranslation } from 'react-i18next';
import { getBridgedFunctions, getAction, Action } from '@zextras/carbonio-shell-ui';
import { useDispatch } from 'react-redux';
import InviteReplyPart from './parts/invite-reply-part';
import ProposedTimeReply from './parts/proposed-time-reply';
import { normalizeInvite } from '../../normalizations/normalize-invite';
import { inviteToEvent } from '../../hooks/use-invite-to-event';
import { getInvite } from '../../store/actions/get-invite';
import { CALENDAR_APP_ID, CALENDAR_ROUTE } from '../../constants';
import BodyMessageRenderer from '../../commons/body-message-renderer.jsx';
import { useInvite } from '../../hooks/use-invite';

/**
   @todo: momentary variables to dynamize
* */
const chatLink = false;
const haveEquipment = false;

export function mailToContact(contact: object): Action | undefined {
	const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
	return available ? mailTo : undefined;
}

const InviteContainer = styled(Container)`
	border: 1px solid ${({ theme }: any): string => theme.palette.gray2.regular};
	border-radius: 14px;
	margin: ${({ theme }: any): string => theme.sizes.padding.extrasmall};
`;

const LinkText = styled(Text)`
	cursor: pointer;
	text-decoration: underline;
	&:hover {
		text-decoration: none;
	}
`;

type InviteResponse = {
	inviteId: string;
	invite: any;
	participationStatus: string;
	compNum: string;
	method: string;
	moveToTrash: () => void;
	mailMsg: any;
	onLoadChange: () => void;
	to: { address: string; fullName: string; name: string; type: string };
	parent: string;
	isAttendee: boolean;
};

type Participant = {
	a: string;
	d: string;
	ptst: 'NE' | 'AC' | 'TE' | 'DE' | 'DG' | 'CO' | 'IN' | 'WE' | 'DF';
	role: 'OPT' | 'REQ';
	rsvp: boolean;
	url: string;
};

const InviteResponse: FC<InviteResponse> = ({
	inviteId,
	participationStatus,
	invite,
	compNum,
	method,
	moveToTrash,
	mailMsg,
	onLoadChange,
	to,
	parent,
	isAttendee
}): ReactElement => {
	const dispatch = useDispatch();
	const [t] = useTranslation();
	useEffect(() => {
		if (!mailMsg.read) {
			onLoadChange();
		}
	}, [mailMsg.read, onLoadChange]);
	const fullInvite = useInvite(mailMsg?.id);

	const apptTime = useMemo(() => {
		if (invite[0]?.comp[0]?.allDay) {
			return moment(invite[0]?.comp[0].s[0].d).format(`dddd, DD MMM, YYYY`);
		}
		return moment(invite[0]?.comp[0].s[0].u).format(
			`dddd, DD MMM, YYYY [${moment(invite[0]?.comp[0].s[0].u).format(`HH:mm`)}]-[${moment(
				invite[0]?.comp[0].e[0].u
			).format(`HH:mm`)}]`
		);
	}, [invite]);

	const apptTimeZone = useMemo(
		() =>
			`${moment(invite[0]?.comp[0].s[0].u).tz(moment.tz.guess()).format('Z')} ${moment.tz.guess()}`,
		[invite]
	);

	const [maxReqParticipantsToShow, setMaxReqParticipantsToShow] = useState(4);
	const requiredParticipants = useMemo(
		() => invite[0]?.comp[0].at.filter((user: Participant) => user.role === 'REQ'),
		[invite]
	);

	const [maxOptParticipantsToShow, setMaxOptParticipantsToShow] = useState(5);
	const optionalParticipants = useMemo(
		() => invite[0]?.comp[0].at.filter((user: Participant) => user.role === 'OPT'),
		[invite]
	);

	const replyMsg = (user: Participant): void => {
		const obj = {
			email: {
				email: {
					mail: user.a
				}
			},
			firstName: user.d ?? user.d ?? user.a,
			middleName: ''
		};
		// disabled because click expect a click event
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mailToContact(obj)?.click();
	};

	const proposeNewTime = useCallback(() => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		dispatch(getInvite({ inviteId })).then((res) => {
			const normalizedInvite = { ...normalizeInvite(res.payload.m), ...res.payload.m };
			const requiredEvent = inviteToEvent(normalizeInvite(res.payload.m));
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			getBridgedFunctions().addBoard(
				`${CALENDAR_ROUTE}/edit?edit=${res?.payload?.m?.inv[0]?.comp[0]?.apptId}`,
				{
					app: CALENDAR_APP_ID,
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					event: requiredEvent,
					invite: normalizedInvite,
					proposeNewTime: true
				}
			);
		});
	}, [dispatch, inviteId]);
	return (
		<InviteContainer padding={{ all: 'extralarge' }}>
			<Container padding={{ horizontal: 'small', vertical: 'large' }} width="100%">
				<Row width="fill" mainAlignment="flex-start" padding={{ bottom: 'extrasmall' }}>
					{method === 'COUNTER' ? (
						<Text weight="light" size="large">
							{mailMsg.subject}
						</Text>
					) : (
						<>
							<Text weight="regular" size="large" style={{ fontSize: '18px' }}>
								{`${invite[0]?.comp[0]?.or?.d || invite[0]?.comp[0]?.or?.a} ${t(
									'message.invited_you',
									'invited you to '
								)}`}
							</Text>
							&nbsp;
							<Text weight="bold" size="large" style={{ fontSize: '18px' }}>
								{mailMsg.subject ? mailMsg.subject : invite[0]?.comp[0].name}
							</Text>
						</>
					)}
				</Row>
				<Row width="100%" mainAlignment="flex-start">
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'extrasmall' }}>
						<Text overflow="break-word" style={{ fontSize: '14px' }}>
							{apptTime}
						</Text>
					</Row>
					<Row width="100%" mainAlignment="flex-start" padding={{ top: 'small' }}>
						<Text color="gray1" size="small" overflow="break-word" style={{ fontSize: '14px' }}>
							GMT {apptTimeZone}
						</Text>
					</Row>
				</Row>
				{method === 'COUNTER'
					? parent !== '5' && (
							// eslint-disable-next-line react/jsx-indent
							<ProposedTimeReply
								invite={invite}
								id={invite[0]?.comp?.[0]?.apptId}
								inviteId={inviteId}
								moveToTrash={moveToTrash}
								title={mailMsg.subject}
								to={to}
								fragment={invite[0]?.comp?.[0]?.fr}
							/>
					  )
					: isAttendee && (
							// eslint-disable-next-line react/jsx-indent
							<InviteReplyPart
								inviteId={inviteId}
								participationStatus={participationStatus}
								invite={invite}
								compNum={compNum}
								proposeNewTime={proposeNewTime}
								parent={parent}
							/>
					  )}

				{invite[0]?.comp[0].loc && (
					<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Tooltip placement="left" label={t('tooltip.location', 'Location')}>
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="PinOutline" />
							</Row>
						</Tooltip>

						<Row takeAvailableSpace mainAlignment="flex-start">
							<Tooltip placement="right" label={invite[0]?.comp[0]?.or?.a}>
								<Text size="medium" overflow="break-word">
									{invite[0]?.comp[0].loc}
								</Text>
							</Tooltip>
						</Row>
					</Row>
				)}

				{chatLink && (
					<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large' }}>
						<Tooltip placement="left" label={t('tooltip.virtual_chat', 'Virtual Chat')}>
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="VideoOutline" />
							</Row>
						</Tooltip>

						<Row takeAvailableSpace mainAlignment="flex-start">
							<Tooltip placement="right" label="link">
								<LinkText color="primary" size="medium" overflow="break-word">
									{t('tooltip.chat_room', 'Chat&#39;s room')}
								</LinkText>
							</Tooltip>
						</Row>
					</Row>
				)}

				{haveEquipment && (
					<Row width="fill" mainAlignment="flex-start" padding={{ top: 'large', bottom: 'small' }}>
						<Tooltip placement="left" label={t('tooltip.equipment', 'Equipment')}>
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="BriefcaseOutline" />
							</Row>
						</Tooltip>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Tooltip placement="right" label={t('tooltip.equipment', 'Equipment')}>
								<Text size="medium" overflow="break-word">
									{/* TODO: Equipment name */}
								</Text>
							</Tooltip>
						</Row>
					</Row>
				)}

				<Row
					width="100%"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ vertical: 'medium' }}
				>
					<Row width="50%" mainAlignment="flex-start" crossAlignment="flex-start">
						<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
							<Icon size="large" icon="PeopleOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start" crossAlignment="flex-start">
							<Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
								<Text overflow="break-word">
									{t('message.required_participant', {
										count: requiredParticipants.length,
										defaultValue: '{{count}} Participant',
										defaultValue_plural: '{{count}} Participants'
									})}
								</Text>
							</Row>

							<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
								{invite[0]?.comp[0]?.or?.d ? (
									<Tooltip placement="top" label={invite[0]?.comp[0]?.or?.a} maxWidth="100%">
										<div>
											<Chip
												avatarLabel={invite[0]?.comp[0]?.or?.d}
												label={
													<>
														<Text size="small">{invite[0]?.comp[0]?.or?.d}</Text>&nbsp;
														<Text size="small" color="secondary">
															({t('message.organizer')})
														</Text>
													</>
												}
												background="gray3"
												color="secondary"
												actions={[
													{
														id: 'action1',
														label: t('message.send_email'),
														type: 'button',
														icon: 'EmailOutline',
														onClick: () => replyMsg(invite[0]?.comp[0]?.or)
													}
												]}
											/>
										</div>
									</Tooltip>
								) : (
									<Chip
										avatarLabel={invite[0]?.comp[0]?.or?.a}
										label={
											<>
												<Text>{invite[0]?.comp[0]?.or?.a}</Text>&nbsp;
												<Text color="secondary">({t('message.organizer')})</Text>
											</>
										}
										background="gray3"
										color="text"
										actions={[
											{
												id: 'action1',
												label: t('message.send_email'),
												type: 'button',
												icon: 'EmailOutline',
												onClick: () => replyMsg(invite[0]?.comp[0]?.or)
											}
										]}
									/>
								)}
							</Row>
							{requiredParticipants.map((p: Participant, index: number) => (
								<>
									{index < maxReqParticipantsToShow && (
										<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
											{p.d ? (
												<Tooltip placement="top" label={p.a} maxWidth="100%">
													<div>
														<Chip
															label={p.d}
															background="gray3"
															color="text"
															actions={[
																{
																	id: 'action2',
																	label: t('message.send_email'),
																	type: 'button',
																	icon: 'EmailOutline',
																	onClick: () => replyMsg(p)
																}
															]}
														/>
													</div>
												</Tooltip>
											) : (
												<Chip
													label={p.a}
													background="gray3"
													color="text"
													actions={[
														{
															id: 'action2',
															label: t('message.send_email'),
															type: 'button',
															icon: 'EmailOutline',
															onClick: () => replyMsg(p)
														}
													]}
												/>
											)}
										</Row>
									)}
								</>
							))}
							{maxReqParticipantsToShow < requiredParticipants.length && (
								<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
									<LinkText
										color="primary"
										size="medium"
										onClick={(): void => setMaxReqParticipantsToShow(requiredParticipants.length)}
										overflow="break-word"
									>
										{t('message.more', 'More...')}
									</LinkText>
								</Row>
							)}
						</Row>
					</Row>

					{optionalParticipants.length > 0 && (
						<Row width="50%" mainAlignment="flex-start" crossAlignment="flex-start">
							<Row mainAlignment="flex-start" padding={{ right: 'small' }}>
								<Icon size="large" icon="OptionalInviteeOutline" />
							</Row>
							<Row takeAvailableSpace mainAlignment="flex-start" crossAlignment="flex-start">
								<Row mainAlignment="flex-start" width="100%" padding={{ bottom: 'extrasmall' }}>
									<Text overflow="break-word">
										{t('message.optional_participant', {
											count: optionalParticipants.length,
											defaultValue: '{{count}} Optional',
											defaultValue_plural: '{{count}} Optionals'
										})}
									</Text>
								</Row>
								{optionalParticipants.map((p: Participant, index: number) => (
									<>
										{index < maxOptParticipantsToShow && (
											<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
												{p.d ? (
													<Tooltip placement="top" label={p.a} maxWidth="100%">
														<div>
															<Chip
																label={p.d}
																background="gray3"
																color="text"
																actions={[
																	{
																		id: 'action2',
																		label: t('message.send_email'),
																		type: 'button',
																		icon: 'EmailOutline',
																		onClick: () => replyMsg(p)
																	}
																]}
															/>
														</div>
													</Tooltip>
												) : (
													<Chip
														label={p.a}
														background="gray3"
														color="text"
														actions={[
															{
																id: 'action2',
																label: t('message.send_email'),
																type: 'button',
																icon: 'EmailOutline',
																onClick: () => replyMsg(p)
															}
														]}
													/>
												)}
											</Row>
										)}
									</>
								))}
								{maxOptParticipantsToShow < optionalParticipants.length && (
									<Row mainAlignment="flex-start" width="100%" padding={{ top: 'small' }}>
										<LinkText
											color="primary"
											size="medium"
											// eslint-disable-next-line max-len
											onClick={(): void => setMaxOptParticipantsToShow(optionalParticipants.length)}
											overflow="break-word"
										>
											{t('message.more', 'More...')}
										</LinkText>
									</Row>
								)}
							</Row>
						</Row>
					)}
				</Row>

				{fullInvite && (
					<Row
						width="100%"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ bottom: 'large' }}
					>
						<Row width="100%" padding={{ vertical: 'medium' }}>
							<Divider />
						</Row>
						<Row padding={{ right: 'small' }}>
							<Icon size="large" icon="MessageSquareOutline" />
						</Row>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<BodyMessageRenderer
								fullInvite={fullInvite}
								inviteId={inviteId}
								parts={fullInvite?.parts}
							/>
						</Row>
					</Row>
				)}
			</Container>
		</InviteContainer>
	);
};

export default InviteResponse;
