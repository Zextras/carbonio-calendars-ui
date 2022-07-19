/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, ReactElement, useCallback, useEffect, useState } from 'react';
import { Padding, Row, Input, IconButton } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

type CustomComponentProps = {
	value: Date;
	onClick: () => void;
	onChange: (a: string) => unknown;
	label: string;
	icon: string;
};

const CustomInputWrapper = styled(Row)`
	border-bottom: 1px solid ${({ theme }): string => theme.palette.gray4};
	border-radius: 2px;
	&:hover {
		background: ${({ theme }): string => theme.palette.gray2};
	}

	&:focus-within {
		border-bottom: 1px solid ${({ theme }): string => theme.palette.primary};
	}
`;

const DatePickerCustomComponent: FC<CustomComponentProps> = ({
	value,
	onClick,
	onChange,
	label,
	icon = 'CalendarOutline'
}): ReactElement => {
	const [input, setInput] = useState(value.toString());
	const [timer, setTimer] = useState<null | ReturnType<typeof setTimeout>>(null);

	const throttledOnChange = useCallback(
		(data) => {
			clearTimeout(timer as ReturnType<typeof setTimeout>);
			const newTimer = setTimeout(() => {
				onChange(data);
			}, 1000);

			setTimer(newTimer);
		},
		[onChange, timer]
	);

	useEffect(() => {
		setInput(value.toString());
	}, [value]);

	return (
		<CustomInputWrapper background="gray4">
			<Row takeAvailableSpace minWidth="150px" background="transparent">
				<Input
					label={label}
					value={input}
					onChange={(e: React.FormEvent<HTMLInputElement>): void => {
						setInput((e.target as HTMLInputElement).value);
						throttledOnChange(e);
					}}
					hideBorder
					disabled
				/>
			</Row>
			<Row>
				<Padding horizontal="small">
					<IconButton
						icon={icon}
						size="large"
						onClick={onClick}
						backgroundColor="transparent"
						iconColor="text"
					/>
				</Padding>
			</Row>
		</CustomInputWrapper>
	);
};

export default DatePickerCustomComponent;
