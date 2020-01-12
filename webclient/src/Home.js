import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useParams } from 'react-router-dom';
import './light.css';
import { Container, Divider, Dropdown, Form, Grid, Header, Icon, Image, Menu, Message, Segment, Table } from 'semantic-ui-react';
import { BasicTable, staticUrl, requester } from './utils.js';
import { LoginForm, SignupForm } from './LoginSignup.js';

function SignupDetailsForm(props) {
	const member = props.user.member;
	const [input, setInput] = useState({ ...member, set_details: true });
	const [error, setError] = useState({});
	const [loading, setLoading] = useState(false);

	const handleValues = (e, v) => setInput({ ...input, [v.name]: v.value });
	const handleChange = (e) => handleValues(e, e.currentTarget);

	const handleSubmit = (e) => {
		setLoading(true);
		requester('/members/' + member.id + '/', 'PATCH', props.token, input)
		.then(res => {
			console.log(res);
			setError({});
			props.setUserCache({...props.user, member: res});
		})
		.catch(err => {
			setLoading(false);
			console.log(err);
			setError(err.data);
		});
	};

	const makeProps = (name) => ({
		name: name,
		onChange: handleChange,
		value: input[name],
		error: error[name],
	});

	return (
		<Form onSubmit={handleSubmit}>
			<Header size='medium'>Enter Member Details</Header>
			<Form.Input
				label='Preferred First Name'
				{...makeProps('preferred_name')}
			/>
			<Form.Input
				label='Phone Number (999) 555-1234'
				{...makeProps('phone')}
			/>
			<Form.Input
				label='Emergency Contact Name'
				{...makeProps('emergency_contact_name')}
			/>
			<Form.Input
				label='Emergency Contact Phone'
				{...makeProps('emergency_contact_phone')}
			/>

			<Form.Button loading={loading} error={error.non_field_errors}>
				Submit
			</Form.Button>
		</Form>
	);
};

function MemberInfo(props) {
	const user = props.user;
	const member = user.member;

	const lastTrans = user.transactions && user.transactions.slice(-3).slice().reverse();
	const lastCard = user.cards && user.cards.sort((a, b) => a.last_seen_at < b.last_seen_at)[0];

	return (
		<div>
			<Grid stackable>
				<Grid.Column width={5}>
					<Image
						size='small'
						src={member.photo_medium ? staticUrl + '/' + member.photo_medium : '/nophoto.png'}
					/>
				</Grid.Column>

				<Grid.Column width={11}>
					<Header size='large'>
						<Icon.Group size='small'>
							<Icon name='circle' color='green' />
						</Icon.Group>
						<Header.Content>{member.preferred_name} {member.last_name}</Header.Content>
					</Header>

					<BasicTable>
						<Table.Body>
							<Table.Row>
								<Table.Cell>Status:</Table.Cell>
								<Table.Cell>{member.status || 'Unknown'}</Table.Cell>
							</Table.Row>
							<Table.Row>
								<Table.Cell>Expiry:</Table.Cell>
								<Table.Cell>{member.expire_date}</Table.Cell>
							</Table.Row>
						</Table.Body>
					</BasicTable>
				</Grid.Column>
			</Grid>

			<Header size='medium'>Details</Header>
			<BasicTable>
				<Table.Body>
					<Table.Row>
						<Table.Cell>Application:</Table.Cell>
						<Table.Cell>{member.application_date || 'Unknown'}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Start:</Table.Cell>
						<Table.Cell>{member.current_start_date || 'Unknown'}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Vetted:</Table.Cell>
						<Table.Cell>{member.vetted_date || 'Not vetted'}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Monthly:</Table.Cell>
						<Table.Cell>${member.monthly_fees || 'Unknown'}</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.Cell>Card Number:</Table.Cell>
						<Table.Cell>{lastCard && lastCard.card_number || 'None'}</Table.Cell>
					</Table.Row>
				</Table.Body>
			</BasicTable>

			<Header size='medium'>Latest Transactions</Header>
			<BasicTable>
				<Table.Body>
					{lastTrans.length ?
						lastTrans.map((x, i) =>
							<Table.Row key={i}>
								<Table.Cell>
									<Link to={'/transactions/'+x.id}>{x.date}</Link>
								</Table.Cell>
								<Table.Cell>{x.account_type}</Table.Cell>
								<Table.Cell>${x.amount}</Table.Cell>
							</Table.Row>
						)
					:
						<Table.Row><Table.Cell>None</Table.Cell></Table.Row>
					}
				</Table.Body>
			</BasicTable>
		</div>
	);
};

export function Home(props) {
	const { token, setTokenCache, user, setUserCache } = props;

	return (
		<Container>
			<Grid stackable padded columns={2}>
				<Grid.Column>
					{user ?
						user.member.set_details ?
							<MemberInfo user={user} />
						:
							<SignupDetailsForm token={token} user={user} setUserCache={setUserCache} />
					:
						<div>
							<LoginForm setTokenCache={setTokenCache} />

							<Divider section horizontal>Or</Divider>

							<SignupForm setTokenCache={setTokenCache} />
						</div>
					}
				</Grid.Column>
				<Grid.Column>
					<Segment>
						<Header size='medium'>Home</Header>
						<p>Welcome to the Protospace member portal! Here you can view member info, join classes, and manage your membership.</p>

						<Header size='medium'>Quick Links</Header>
						<p><a href='http://protospace.ca/' target='_blank' rel='noopener noreferrer'>Main Website</a></p>
						<p><a href='http://wiki.protospace.ca/Welcome_to_Protospace' target='_blank' rel='noopener noreferrer'>Protospace Wiki</a></p>
						<p><a href='https://groups.google.com/forum/#!forum/protospace-discuss' target='_blank' rel='noopener noreferrer'>Discussion Google Group</a></p>
						<p><a href='https://drive.google.com/open?id=0By-vvp6fxFekfmU1cmdxaVRlaldiYXVyTE9rRnNVNjhkc3FjdkFIbjBwQkZ3MVVQX2Ezc3M' target='_blank' rel='noopener noreferrer'>Google Drive</a></p>

						<Header size='medium'>Protospace Stats</Header>
						<p>Next member meeting: Jan 01, 2099</p>
						<p>Next monthly clean: Jan 01, 2099</p>
						<p>Current member count: 200</p>
						<p>Due members: 20</p>
						<p>Expired members: 100</p>
						<p>Bay 108 temperature: 21 C</p>
						<p>Bay 110 temperature: 22 C</p>

					</Segment>
				</Grid.Column>
			</Grid>
		</Container>
	);
};