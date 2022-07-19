/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Button, ChipInput, Container, Row } from '@zextras/carbonio-design-system';
import { useIntegratedComponent } from '@zextras/carbonio-shell-ui';
import { some } from 'lodash';
import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
	selectEditorAttendees,
	selectEditorOptionalAttendees
} from '../../../store/selectors/editor';
import { EditorCallbacks } from '../../../types/editor';

type EditorAttendeesProps = {
	editorId: string;
	callbacks: EditorCallbacks;
	disabled?: boolean;
};

export const AttendeesContainer = styled.div`
	width: calc(
		100% - ${({ hasTooltip }: { hasTooltip?: boolean }): string => (hasTooltip ? `48px` : '0px')}
	);
	height: fit-content;
	background: ${({ theme }): string => theme.palette.gray5.regular};
	border-bottom: 1px solid ${({ theme }): string => theme.palette.gray2.regular};
	[class^='Chip__ChipComp'] {
		[class^='Text__Comp'] {
			color: ${({ theme }): string => theme.palette.text.regular};
		}
	}
`;

export const EditorAttendees = ({
	editorId,
	callbacks,
	disabled = false
}: EditorAttendeesProps): ReactElement => {
	const [t] = useTranslation();
	const [ContactInput, integrationAvailable] = useIntegratedComponent('contact-input');
	const [showOptionals, setShowOptional] = useState(false);
	const toggleOptionals = useCallback(() => setShowOptional((show) => !show), []);
	const { onAttendeesChange, onOptionalAttendeesChange } = callbacks;

	const attendees = useSelector(selectEditorAttendees(editorId));
	const optionalAttendees = useSelector(selectEditorOptionalAttendees(editorId));

	// const isDisabled = useMemo(() => updateAppTime || proposeNewTime, []);
	const hasError = useMemo(() => some(attendees ?? [], { error: true }), [attendees]);
	const optionalHasError = useMemo(
		() => some(optionalAttendees ?? [], { error: true }),
		[optionalAttendees]
	);

	return (
		<>
			<AttendeesContainer>
				<Container
					orientation="horizontal"
					background="gray5"
					style={{ overflow: 'hidden' }}
					padding={{ all: 'none' }}
				>
					<Container background="gray5" style={{ overflow: 'hidden' }}>
						{!integrationAvailable ? (
							<ContactInput
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								placeholder={t('label.attendee_plural', 'Attendees')}
								onChange={onAttendeesChange}
								defaultValue={attendees}
								disabled={disabled}
							/>
						) : (
							<ChipInput
								placeholder={t('label.attendee_plural', 'Attendees')}
								background="gray5"
								onChange={(items: any): void => {
									onAttendeesChange(items);
								}}
								defaultValue={attendees}
								hasError={hasError}
								errorLabel=""
								disabled={disabled}
							/>
						)}
					</Container>
					<Container
						width="fit"
						background="gray5"
						padding={{ right: 'medium', left: 'extrasmall' }}
						orientation="horizontal"
					>
						<Button
							label={t('label.optional_plural', 'Optionals')}
							type="ghost"
							labelColor="secondary"
							style={{ padding: 0 }}
							onClick={toggleOptionals}
						/>
					</Container>
				</Container>
			</AttendeesContainer>
			{showOptionals && (
				<Row height="fit" width="fill" padding={{ top: 'large' }}>
					<AttendeesContainer>
						{integrationAvailable ? (
							<ContactInput
								// eslint-disable-next-line @typescript-eslint/ban-ts-comment
								// @ts-ignore
								placeholder={t('label.optional_plural', 'Optionals')}
								onChange={onOptionalAttendeesChange}
								defaultValue={optionalAttendees}
								disabled={disabled}
							/>
						) : (
							<ChipInput
								placeholder={t('label.optional_plural', 'Optionals')}
								background="gray5"
								onChange={(items: any): void => {
									onOptionalAttendeesChange(items);
								}}
								defaultValue={optionalAttendees}
								hasError={optionalHasError}
								errorLabel=""
								disabled={disabled}
							/>
						)}
					</AttendeesContainer>
				</Row>
			)}
		</>
	);
};
